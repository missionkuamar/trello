import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../../redux/slices/taskSlice';
import { getAllUsers } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

export default function AddTaskModal({ isOpen, onClose, onSuccess, boardId }) {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    category: 'personal',
    board: boardId,
  });
  const [errors, setErrors] = useState({});

  // ✅ Check if current user is admin
  const isAdmin = user?.role === 'admin';

  
 const filteredUsers =
  users?.filter((u) => {
    if (user?.role === "admin") return true;

    if (user?.role === "moderator") {
      return (
        (u.role === "moderator" || u.role === "user") &&
        u._id !== user._id
      );
    }

    if (user?.role === "user") {
      return u.role === "user" && u._id !== user._id;
    }

    return false;
  }) || [];


  console.log("Current User:", user);
console.log("All Users:", users);
console.log("Filtered Users:", filteredUsers);

  useEffect(() => {
    if (isOpen) {
      dispatch(getAllUsers({ limit: 100 }));
      // ✅ Auto-assign to current user if they are a regular user
      if (user && user.role === 'user') {
        setFormData(prev => ({
          ...prev,
          assignedTo: user.id,
          board: boardId,
        }));
      }
    }
  }, [isOpen, dispatch, user, boardId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Please assign a user';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix all errors');
      return;
    }

    setSubmitting(true);
    try {
      const taskData = {
        ...formData,
        board: boardId,
      };
      
      console.log('📝 Creating task with data:', taskData);
      
      await dispatch(createTask(taskData)).unwrap();
      toast.success('Task created successfully!');
      onSuccess();
      onClose();
      
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium',
        status: 'todo',
        category: 'personal',
        board: boardId,
      });
      setErrors({});
    } catch (error) {
      console.error('❌ Create task error:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">➕ Add New Task</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
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
                rows={3}
                placeholder="Enter task description..."
                className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
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
                {errors.assignedTo && <p className="mt-1 text-sm text-red-500">{errors.assignedTo}</p>}
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
                {errors.dueDate && <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>}
              </div>
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
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

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}