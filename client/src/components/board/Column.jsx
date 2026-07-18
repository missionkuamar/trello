import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard';

export default function Column({ column, tasks, onTaskMove, onTaskClick }) {
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => {
     // console.log('📦 Dropped:', item, 'to:', column.id);
      // ✅ Only move if status is different
      if (item.status !== column.id) {
        onTaskMove(item.id, item.status, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 border-gray-300',
      'in-progress': 'bg-blue-50 border-blue-300',
      review: 'bg-purple-50 border-purple-300',
      done: 'bg-green-50 border-green-300',
    };
    return colors[status] || 'bg-gray-50 border-gray-300';
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

  return (
    <div
      ref={drop}
      className={`rounded-lg p-3 min-h-[400px] border-2 transition-colors ${
        isOver ? 'border-primary-400 bg-primary-50' : getStatusColor(column.id)
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getStatusIcon(column.id)}</span>
          <h3 className="font-semibold text-gray-700">{column.title}</h3>
          <span className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((task, index) => (
          <TaskCard
            key={task._id}
            task={task}
            index={index}
            status={column.id}
            onClick={() => onTaskClick(task)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}