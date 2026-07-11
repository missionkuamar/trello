import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTaskById } from '../../redux/slices/taskSlice';
import TaskModal from '../board/TaskModal';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

export default function RecentTasks({ tasks, limit = 5 }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const displayedTasks = tasks?.slice(0, limit) || [];

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

  // ✅ Fixed: Handle view task
  const handleViewTask = async (taskId) => {
    setLoading(true);
    try {
      // Find task from existing tasks list
      const task = tasks.find(t => t._id === taskId);
      if (task) {
        setSelectedTask(task);
        setIsModalOpen(true);
      } else {
        // If not found, fetch from API
        const result = await dispatch(fetchTaskById(taskId)).unwrap();
        setSelectedTask(result.task);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  if (displayedTasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Tasks</h2>
          <Link to="/tasks" className="text-sm text-primary-600 hover:underline">
            View All →
          </Link>
        </div>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p>No tasks yet</p>
          <Link to="/tasks/create" className="text-primary-600 hover:underline text-sm">
            Create your first task
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Tasks</h2>
          <Link to="/tasks" className="text-sm text-primary-600 hover:underline">
            View All →
          </Link>
        </div>

        <div className="space-y-2">
          {displayedTasks.map((task) => (
            <div
              key={task._id}
              to={`/tasks/${task._id}`}
            className="flex items-center justify-between border-b border-gray-100 pb-2 hover:bg-gray-50 rounded-lg p-2 transition-colors group"
          >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)} {task.status}
                  </span>
                </div>
                {task.description && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  {task.assignedTo && (
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-[8px] font-semibold">
                        {task.assignedTo.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                      {task.assignedTo.name}
                    </span>
                  )}
                  {task.dueDate && (
                    <span>
                      📅 {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <span>
                    🏷️ {task.priority || 'medium'}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewTask(task._id);
                }}
                className="ml-2 text-primary-600 hover:text-primary-800 text-sm font-medium whitespace-nowrap"
              >
                View →
              </button>
            </div>
          ))}
        </div>

        {tasks.length > limit && (
          <div className="mt-4 text-center">
            <Link to="/tasks" className="text-sm text-primary-600 hover:underline">
              Show all {tasks.length} tasks →
            </Link>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={handleCloseModal}
          onUpdate={() => {
            // Refresh tasks after update - will be handled by parent
            handleCloseModal();
          }}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      )}
    </>
  );
}