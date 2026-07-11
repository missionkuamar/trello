import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskById, clearCurrentTask, deleteTask, addComment, uploadAttachment, updateTask } from '../../redux/slices/taskSlice';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTask: task, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    dueDate: '',
    category: '',
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(id));
    }
    return () => {
      dispatch(clearCurrentTask());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || '',
        priority: task.priority || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        category: task.category || '',
      });
    }
  }, [task]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await dispatch(deleteTask(id));
      navigate('/tasks');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    try {
      await dispatch(addComment({ id, text: comment })).unwrap();
      toast.success('Comment added!');
      setComment('');
      dispatch(fetchTaskById(id));
    } catch (error) {
      toast.error(error.message || 'Failed to add comment');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('attachment', file);

    try {
      await dispatch(uploadAttachment({ id, file: formData })).unwrap();
      toast.success('File uploaded!');
      dispatch(fetchTaskById(id));
    } catch (error) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateTask({ id, data: formData })).unwrap();
      toast.success('Task updated successfully!');
      setIsEditing(false);
      dispatch(fetchTaskById(id));
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      urgent: '🔴',
    };
    return icons[priority] || '🟡';
  };

  const isEditable = user?.role !== 'user' || task?.assignedTo?._id === user?.id;

  if (isLoading) return <Loading />;

  if (!task) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-700">Task Not Found</h2>
        <p className="text-gray-500 mt-2">The task you're looking for doesn't exist.</p>
        <Link to="/tasks" className="inline-block mt-4 text-primary-600 hover:underline">
          ← Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/tasks" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Task Details</h1>
        </div>
        <div className="flex gap-2">
          {isEditable && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                {isEditing ? 'Cancel Edit' : '✏️ Edit'}
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Task Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          {isEditing ? (
            // Edit Form
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="study">Study</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                Update Task
              </button>
            </form>
          ) : (
            // View Mode
            <div className="space-y-6">
              {/* Title & Status */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)} {task.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)} {task.priority}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-400 text-right">
                  <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
                  <div>Updated: {new Date(task.updatedAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700">Description</h3>
                <p className="mt-2 text-gray-600 whitespace-pre-wrap">
                  {task.description || 'No description provided.'}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Assigned To</h4>
                  <div className="mt-1 flex items-center gap-2">
                    {task.assignedTo?.avatar ? (
                      <img src={task.assignedTo.avatar} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                        {task.assignedTo?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="font-medium">{task.assignedTo?.name || 'Unassigned'}</span>
                    <span className="text-sm text-gray-400">({task.assignedTo?.email})</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Assigned By</h4>
                  <div className="mt-1 flex items-center gap-2">
                    {task.assignedBy?.avatar ? (
                      <img src={task.assignedBy.avatar} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold">
                        {task.assignedBy?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="font-medium">{task.assignedBy?.name || 'Unknown'}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                  <p className="mt-1 font-medium">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Category</h4>
                  <p className="mt-1 font-medium capitalize">{task.category || 'N/A'}</p>
                </div>
              </div>

              {/* Labels */}
              {task.labels && task.labels.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-500">Labels</h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {task.labels.map((label, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Status */}
              {task.isCompleted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm">
                    ✅ Completed on {task.completedAt ? new Date(task.completedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attachments Section */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📎 Attachments</h3>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="flex-1 text-sm"
          />
          {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
        </div>
        {task.attachments?.length === 0 ? (
          <p className="text-gray-500 text-sm">No attachments</p>
        ) : (
          <div className="space-y-2">
            {task.attachments.map((att, idx) => (
              <a
                key={idx}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-sm font-medium">{att.name}</p>
                    <p className="text-xs text-gray-400">
                      {(att.size / 1024).toFixed(1)} KB • {att.type}
                    </p>
                  </div>
                </div>
                <span className="text-primary-600 hover:underline text-sm">Download</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">💬 Comments ({task.comments?.length || 0})</h3>
        <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Post
          </button>
        </form>
        {task.comments?.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No comments yet</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {task.comments.map((c, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {c.user?.avatar ? (
                      <img src={c.user.avatar} alt="" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-semibold">
                        {c.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="font-medium text-sm">{c.user?.name || 'Unknown'}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{c.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}