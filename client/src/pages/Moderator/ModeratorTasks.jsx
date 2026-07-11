import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTasks, deleteTask, setPage, createTask, updateTask } from '../../redux/slices/taskSlice';
import { getAllUsers } from '../../redux/slices/authSlice';
import Loading from '../../components/common/Loading';
import TaskModal from '../../components/board/TaskModal';
import toast from 'react-hot-toast';

export default function ModeratorTasks() {
    const dispatch = useDispatch();
    const { tasks, isLoading, page, totalPages } = useSelector((state) => state.tasks);
    const { users } = useSelector((state) => state.auth);
   // console.log(users)
    // ✅ Filter states
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ✅ Task Modal states
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ✅ Create Task Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
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

    // ✅ Assign Modal states
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [assignToUserId, setAssignToUserId] = useState('');

    // ✅ Filter users - only regular users (not admin/moderator)
    const regularUsers = users?.filter((u) => u.role === 'user') || [];
    console.log('regularUsers and  user ', regularUsers, users)
    // ✅ Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);



      // ✅ Fetch tasks and users
      useEffect(() => {
        dispatch(fetchTasks({ page, limit: 10, status, priority, search: debouncedSearch }));
        dispatch(getAllUsers({ limit: 100 }));
      }, [dispatch, page, status, priority, debouncedSearch]);


    // useEffect(() => {
    //     console.log("Fetching users...");
    //     dispatch(getAllUsers({ limit: 100 }));
    // }, [dispatch]);



    // ✅ Delete task
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await dispatch(deleteTask(id));
        }
    };

    // ✅ View task
    const handleViewTask = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    // ✅ Close task modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
        dispatch(fetchTasks({ page, limit: 10, status, priority, search: debouncedSearch }));
    };

    // ✅ Create Task - Change handler
    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // ✅ Create Task - User select handler
    const handleUserSelect = (e) => {
        const userId = e.target.value;
        setFormData({ ...formData, assignedTo: userId });
        if (errors.assignedTo) {
            setErrors({ ...errors, assignedTo: '' });
        }
    };

    // ✅ Create Task - Validate form
    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
        if (!formData.assignedTo) newErrors.assignedTo = 'Please assign a user';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ✅ Create Task - Submit
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix all errors');
            return;
        }

        setSubmitting(true);
        try {
            await dispatch(createTask(formData)).unwrap();
            toast.success('Task created successfully!');
            setShowCreateModal(false);
            setFormData({
                title: '',
                description: '',
                assignedTo: '',
                dueDate: '',
                priority: 'medium',
                status: 'todo',
                category: 'personal',
            });
            dispatch(fetchTasks({ page, limit: 10, status, priority, search: debouncedSearch }));
        } catch (error) {
            toast.error(error.message || 'Failed to create task');
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Assign Task - Open modal
    const handleAssignTask = (taskId) => {
        setSelectedTaskId(taskId);
        setAssignToUserId('');
        setShowAssignModal(true);
    };

    // ✅ Assign Task - User select
    const handleAssignUserSelect = (e) => {
        setAssignToUserId(e.target.value);
    };

    // ✅ Assign Task - Submit
    const handleAssignSubmit = async () => {
        if (!assignToUserId) {
            toast.error('Please select a user');
            return;
        }

        try {
            await dispatch(updateTask({
                id: selectedTaskId,
                data: { assignedTo: assignToUserId }
            })).unwrap();
            toast.success('Task reassigned successfully!');
            setShowAssignModal(false);
            dispatch(fetchTasks({ page, limit: 10, status, priority, search: debouncedSearch }));
        } catch (error) {
            toast.error(error.message || 'Failed to reassign task');
        }
    };

    // ✅ Helper functions for styling
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

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800',
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    // console.log(regularUsers)
    if (isLoading) return <Loading />;

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">📋 All Tasks</h1>
                    <p className="text-sm text-gray-500">Moderator view - Create, manage and assign tasks</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Create Task
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                    <option value="">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                </select>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>

            {/* Tasks Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tasks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No tasks found
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr key={task._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-900">{task.title}</span>
                                                {task.description && (
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">{task.description}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
                                                {getStatusIcon(task.status)} {task.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {task.assignedTo?.name || 'Unassigned'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    onClick={() => handleViewTask(task)}
                                                    className="text-primary-600 hover:underline text-sm"
                                                >
                                                    View
                                                </button>
                                                <Link
                                                    to={`/tasks/edit/${task._id}`}
                                                    className="text-green-600 hover:underline text-sm"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleAssignTask(task._id)}
                                                    className="text-purple-600 hover:underline text-sm"
                                                >
                                                    Assign
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(task._id)}
                                                    className="text-red-600 hover:underline text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 p-4 border-t">
                        <button
                            onClick={() => dispatch(setPage(page - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button
                            onClick={() => dispatch(setPage(page + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* ✅ Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">➕ Create New Task</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleCreateChange}
                                        placeholder="Enter task title..."
                                        className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleCreateChange}
                                        rows={3}
                                        placeholder="Enter task description..."
                                        className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Assign To <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.assignedTo}
                                            onChange={handleUserSelect}
                                            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Select a user...</option>
                                            {regularUsers.map((u) => (
                                                <option key={u._id} value={u._id}>
                                                    {u.name} ({u.email})
                                                </option>
                                            ))}
                                            {regularUsers.length === 0 && (
                                                <option value="" disabled>No users available</option>
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
                                            onChange={handleCreateChange}
                                            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.dueDate ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.dueDate && <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleCreateChange}
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
                                            onChange={handleCreateChange}
                                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="todo">📋 To Do</option>
                                            <option value="in-progress">🔄 In Progress</option>
                                            <option value="review">👀 Review</option>
                                            <option value="done">✅ Done</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleCreateChange}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="personal">👤 Personal</option>
                                        <option value="work">💼 Work</option>
                                        <option value="study">📚 Study</option>
                                        <option value="health">💪 Health</option>
                                        <option value="other">📌 Other</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                    >
                                        {submitting ? 'Creating...' : 'Create Task'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Assign Task Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">🔄 Reassign Task</h3>
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Select User <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={assignToUserId}
                                        onChange={handleAssignUserSelect}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select a user...</option>
                                        {regularUsers.map((u) => (
                                            <option key={u._id} value={u._id}>
                                                {u.name} ({u.email})
                                            </option>
                                        ))}
                                        {regularUsers.length === 0 && (
                                            <option value="" disabled>No users available</option>
                                        )}
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleAssignSubmit}
                                        className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                                    >
                                        Assign Task
                                    </button>
                                    <button
                                        onClick={() => setShowAssignModal(false)}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Detail Modal */}
            {isModalOpen && selectedTask && (
                <TaskModal
                    task={selectedTask}
                    onClose={handleCloseModal}
                    onUpdate={() => {
                        dispatch(fetchTasks({ page, limit: 10, status, priority, search: debouncedSearch }));
                    }}
                />
            )}
        </div>
    );
}