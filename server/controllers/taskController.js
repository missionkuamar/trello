import Task from '../models/Task.js';
import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';

// ✅ Get all tasks with filters
export const getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, search, page = 1, limit = 20 } = req.query;
    const query = {};

    // Role-based filtering
    if (req.user.role === 'user') {
      query.assignedTo = req.user.id;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name email avatar')
        .populate('assignedBy', 'name email')
        .sort({ position: 1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Task.countDocuments(query),
    ]);

    res.json({
      success: true,
      tasks,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get tasks by status (for Kanban board)
export const getTasksByStatus = async (req, res) => {
  try {
    const query = req.user.role === 'user' 
      ? { assignedTo: req.user.id }
      : {};

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email')
      .sort({ position: 1 });

    // Group by status
    const groupedTasks = {
      todo: [],
      'in-progress': [],
      review: [],
      done: [],
    };

    tasks.forEach(task => {
      if (groupedTasks[task.status]) {
        groupedTasks[task.status].push(task);
      }
    });

    res.json({
      success: true,
      tasks: groupedTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single task
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email')
      .populate('comments.user', 'name email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && task.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create task
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      category,
      labels,
      board,
    } = req.body;

    // Validate required fields
    if (!title || !description || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // ✅ Check assigned user exists
    const assignedUser = await User.findById(assignedTo);

    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found",
      });
    }

    // ✅ Current logged-in user's role
    const currentUserRole = req.user.role;

    // ✅ Role permission check
    if (
      currentUserRole === "user" &&
      assignedUser.role !== "user"
    ) {
      return res.status(403).json({
        success: false,
        message: "Users can only assign tasks to other users.",
      });
    }

    if (
      currentUserRole === "moderator" &&
      assignedUser.role === "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Moderators cannot assign tasks to admins.",
      });
    }

    // Get max position
    const query = board
      ? { status: "todo", board }
      : { status: "todo" };

    const lastTask = await Task.findOne(query).sort({
      position: -1,
    });

    const position = lastTask ? lastTask.position + 1 : 0;

    const taskData = {
      title,
      description,
      assignedTo,
      assignedBy: req.user.id,
      dueDate,
      priority: priority || "medium",
      category: category || "personal",
      labels: labels || [],
      position,
    };

    if (board) {
      taskData.board = board;
    }

    const task = await Task.create(taskData);

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email avatar role")
      .populate("assignedBy", "name email role")
      .populate("board", "name");

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    //console.error("❌ Create task error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ✅ Update task
export const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, category, labels } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this task' });
    }

    // Update status completedAt
    let completedAt = task.completedAt;
    if (status === 'done' && task.status !== 'done') {
      completedAt = new Date();
    } else if (status !== 'done') {
      completedAt = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate, category, labels, completedAt },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email avatar');

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskPosition = async (req, res) => {
  try {
    const { taskId, status, position } = req.body;
    
    //console.log('📦 Updating task position:', { taskId, status, position });

    // ✅ Validate inputs
    if (!taskId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Task ID and status are required'
      });
    }

    // ✅ Find task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // ✅ Update status and position
    task.status = status;
    task.position = typeof position === 'number' ? position : 0;
    
    // If status is done, set completedAt
    if (status === 'done' && !task.isCompleted) {
      task.isCompleted = true;
      task.completedAt = new Date();
    } else if (status !== 'done') {
      task.isCompleted = false;
      task.completedAt = null;
    }
    
    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email');

    res.json({
      success: true,
      message: 'Task position updated',
      task: updatedTask,
    });
  } catch (error) {
   // console.error('❌ Update position error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};
// ✅ Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only admin/moderator can delete
    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'Unauthorized to delete tasks' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Upload attachment - FIXED
export const uploadAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          folder: 'task-attachments',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    // ✅ Create attachment object
    const attachment = {
      name: file.originalname || 'unnamed',
      url: result.secure_url,
      type: file.mimetype || 'application/octet-stream',
      size: file.size || 0,
      uploadedAt: new Date(),
    };

    // ✅ Push attachment to array
    task.attachments.push(attachment);
    await task.save();

    res.json({
      success: true,
      message: 'Attachment uploaded successfully',
      attachment: attachment,
      task: task,
    });
  } catch (error) {
   // console.error('❌ Upload attachment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ✅ Add comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      user: req.user.id,
      text,
    });

    await task.save();
    const updatedTask = await Task.findById(req.params.id)
      .populate('comments.user', 'name email avatar');

    res.json({ success: true, message: 'Comment added', task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Assign task (Admin/Moderator only)
export const assignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only admin/moderator can reassign
    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'Unauthorized to reassign tasks' });
    }

    task.assignedTo = assignedTo;
    await task.save();

    const updatedTask = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar');

    res.json({
      success: true,
      message: 'Task reassigned successfully',
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};