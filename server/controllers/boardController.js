import Board from '../models/Board.js';
import Task from '../models/Task.js';
import User from '../models/User.js';




// ✅ Get all boards for user
export const getBoards = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'user') {
      query = {
        $or: [
          { createdBy: req.user.id },
          { 'members.user': req.user.id },
        ],
      };
    }

    const boards = await Board.find(query)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      boards,
    });
  } catch (error) {
    //console.error('❌ Get boards error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ✅ Get single board
export const getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email avatar');

    if (!board) {
      return res.status(404).json({ 
        success: false, 
        message: 'Board not found' 
      });
    }

    // Check access
    const isMember = board.members.some(m => m.user._id.toString() === req.user.id);
    const isCreator = board.createdBy._id.toString() === req.user.id;
    
    if (req.user.role === 'user' && !isMember && !isCreator) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to view this board' 
      });
    }

    res.json({
      success: true,
      board,
    });
  } catch (error) {
   // console.error('❌ Get board error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ✅ Create board
export const createBoard = async (req, res) => {
  try {
    const { name, description, columns } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Board name is required' 
      });
    }

    const defaultColumns = columns || [
      { id: 'todo', title: 'To Do', status: 'todo', order: 0 },
      { id: 'in-progress', title: 'In Progress', status: 'in-progress', order: 1 },
      { id: 'review', title: 'Review', status: 'review', order: 2 },
      { id: 'done', title: 'Done', status: 'done', order: 3 },
    ];

    const board = await Board.create({
      name,
      description,
      columns: defaultColumns,
      members: [],
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      board,
    });
  } catch (error) {
   // console.error('❌ Create board error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ✅ Update board
export const updateBoard = async (req, res) => {
  try {
    const { name, description, columns } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ 
        success: false, 
        message: 'Board not found' 
      });
    }

    // Check permissions
    const isCreator = board.createdBy.toString() === req.user.id;
    if (req.user.role !== 'admin' && !isCreator) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to update this board' 
      });
    }

    board.name = name || board.name;
    board.description = description || board.description;
    if (columns) board.columns = columns;
    await board.save();

    res.json({
      success: true,
      message: 'Board updated successfully',
      board,
    });
  } catch (error) {
   // console.error('❌ Update board error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ✅ Delete board
export const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ 
        success: false, 
        message: 'Board not found' 
      });
    }

    // Check permissions
    const isCreator = board.createdBy.toString() === req.user.id;
    if (req.user.role !== 'admin' && !isCreator) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to delete this board' 
      });
    }

    // Delete all tasks in the board
    await Task.deleteMany({ board: board._id });

    await board.deleteOne();

    res.json({
      success: true,
      message: 'Board deleted successfully',
    });
  } catch (error) {
   // console.error('❌ Delete board error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ✅ Add member to board
export const addMember = async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ 
        success: false, 
        message: 'Board not found' 
      });
    }

    // Check permissions
    const isCreator = board.createdBy.toString() === req.user.id;
    if (req.user.role !== 'admin' && !isCreator) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to add members' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if already a member
    const isMember = board.members.some(m => m.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already a member' 
      });
    }

    board.members.push({ user: userId, role });
    await board.save();

    res.json({
      success: true,
      message: 'Member added successfully',
      board,
    });
  } catch (error) {
   // console.error('❌ Add member error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ✅ Remove member from board
export const removeMember = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ 
        success: false, 
        message: 'Board not found' 
      });
    }

    // Check permissions
    const isCreator = board.createdBy.toString() === req.user.id;
    if (req.user.role !== 'admin' && !isCreator) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to remove members' 
      });
    }

    board.members = board.members.filter(m => m.user.toString() !== req.params.userId);
    await board.save();

    res.json({
      success: true,
      message: 'Member removed successfully',
      board,
    });
  } catch (error) {
    //console.error('❌ Remove member error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ✅ Get board tasks - FIXED
export const getBoardTasks = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ 
        success: false, 
        message: 'Board not found' 
      });
    }

    // Check access
    const isMember = board.members.some(m => m.user.toString() === req.user.id);
    const isCreator = board.createdBy.toString() === req.user.id;
    
    if (req.user.role === 'user' && !isMember && !isCreator) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to view these tasks' 
      });
    }

    // ✅ Get tasks for this specific board
    const tasks = await Task.find({ board: board._id })
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email')
      .sort({ position: 1 });

    // Group by status
    const groupedTasks = {};
    board.columns.forEach(col => {
      groupedTasks[col.status] = tasks.filter(t => t.status === col.status);
    });

    res.json({
      success: true,
      tasks: groupedTasks,
      columns: board.columns,
    });
  } catch (error) {
   // console.error('❌ Get board tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};