import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTaskById, updateTask, clearCurrentTask, deleteTask } from '../../redux/slices/taskSlice';
import { getAllUsers } from '../../redux/slices/authSlice';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

export default function EditTask() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTask: task, isLoading } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    category: 'personal',
  });
  const [errors, setErrors] = useState({});

  // ✅ Check if current user is admin
  const isAdmin = user?.role === 'admin';

  // ✅ Filter users - Admin sees all, others see only regular users
  const filteredUsers = isAdmin 
    ? users || [] 
    : users?.filter((u) => u.role === 'user') || [];

  useEffect(() => {
    dispatch(fetchTaskById(id));
    dispatch(getAllUsers({ limit: 100 }));
    return () => {
      dispatch(clearCurrentTask());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignedTo: task.assignedTo?._id || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        category: task.category || 'personal',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // ✅ Handle user selection from dropdown
  const handleUserSelect = (e) => {
    const userId = e.target.value;
    setFormData({
      ...formData,
      assignedTo: userId,
    });
    if (errors.assignedTo) {
      setErrors({
        ...errors,
        assignedTo: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please assign a user';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix all errors');
      return;
    }

    setSubmitting(true);
    try {
      const result = await dispatch(updateTask({ id, data: formData })).unwrap();
      if (result.success) {
        toast.success('Task updated successfully!');
        navigate(`/tasks/${id}`);
      }
    } catch (error) {
     // console.error('Update task error:', error);
      toast.error(error.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteTask(id)).unwrap();
      toast.success('Task deleted successfully!');
      navigate('/tasks');
    } catch (error) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      done: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      todo: '📋',
      'in-progress': '🔄',
      review: '👀',
      done: '✅',
    };
    return icons[status] || '📋';
  };

  const isEditable = user?.role !== 'user' || task?.assignedTo?._id === user?.id;

  if (isLoading) return <Loading />;

  if (!task) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-700">Task Not Found</h2>
        <p className="text-gray-500 mt-2">The task you're trying to edit doesn't exist.</p>
        <button
          onClick={() => navigate('/tasks')}
          className="inline-block mt-4 text-primary-600 hover:underline"
        >
          ← Back to Tasks
        </button>
      </div>
    );
  }

  if (!isEditable) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-500 mt-2">You don't have permission to edit this task.</p>
        <button
          onClick={() => navigate(`/tasks/${id}`)}
          className="inline-block mt-4 text-primary-600 hover:underline"
        >
          ← Back to Task
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/tasks/${id}`)}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Edit Task</h1>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          🗑️ Delete
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title..."
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter task description..."
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Assign To & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assign To <span className="text-red-500">*</span>
              </label>
              {/* ✅ Admin sees all users, others see only regular users */}
              <select
                value={formData.assignedTo}
                onChange={handleUserSelect}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a user...</option>
                {filteredUsers.length === 0 ? (
                  <option value="" disabled>No users available</option>
                ) : (
                  filteredUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) {u.role === 'admin' ? '⭐' : u.role === 'moderator' ? '🛠️' : ''}
                    </option>
                  ))
                )}
              </select>
              {errors.assignedTo && (
                <p className="mt-1 text-sm text-red-500">{errors.assignedTo}</p>
              )}
              {formData.assignedTo && (
                <div className="mt-2 text-sm text-green-600">
                  ✅ Assigned to: {users?.find(u => u._id === formData.assignedTo)?.name}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="todo">📋 To Do</option>
                <option value="in-progress">🔄 In Progress</option>
                <option value="review">👀 Review</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="personal">👤 Personal</option>
              <option value="work">💼 Work</option>
              <option value="study">📚 Study</option>
              <option value="health">💪 Health</option>
              <option value="other">📌 Other</option>
            </select>
          </div>

          {/* Task Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(task.updatedAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Created By:</span> {task.assignedBy?.name || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Status:</span> {getStatusIcon(task.status)} {task.status}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary-600 text-white py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Task'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/tasks/${id}`)}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Task</h3>
              <p className="text-center text-gray-500 mb-6">
                Are you sure you want to delete "<span className="font-medium text-gray-700">{task.title}</span>"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}