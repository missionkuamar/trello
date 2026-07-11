import { useDrag } from 'react-dnd';

export default function TaskCard({ task, index, status, onClick }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { 
      id: task._id, 
      status: status, 
      index: index 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

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

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-gray-800 text-sm flex-1 line-clamp-2">
          {task.title}
        </h4>
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
          {getPriorityIcon(task.priority)} {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {task.assignedTo && (
            <div className="flex items-center gap-1">
              {task.assignedTo.avatar ? (
                <img
                  src={task.assignedTo.avatar}
                  alt={task.assignedTo.name}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-semibold">
                  {task.assignedTo.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-xs text-gray-600">{task.assignedTo.name}</span>
            </div>
          )}
        </div>

        {task.dueDate && (
          <span className="text-xs text-gray-400">
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {task.attachments?.length > 0 && (
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
          📎 {task.attachments.length}
        </div>
      )}
    </div>
  );
}