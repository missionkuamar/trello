import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { fetchTasksByStatus, updateTaskPosition, updateTask } from '../../redux/slices/taskSlice';
import Column from './Column';
import TaskModal from './TaskModal';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: '📋' },
  { id: 'in-progress', title: 'In Progress', icon: '🔄' },
  { id: 'review', title: 'Review', icon: '👀' },
  { id: 'done', title: 'Done', icon: '✅' },
];

export default function Board() {
  const dispatch = useDispatch();
  const { tasksByStatus, isLoading } = useSelector((state) => state.tasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTasksByStatus());
  }, [dispatch]);

  const handleTaskMove = async (taskId, fromStatus, toStatus, toIndex) => {
    const tasks = tasksByStatus[fromStatus] || [];
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    // Update local state
    const newTasksByStatus = { ...tasksByStatus };
    newTasksByStatus[fromStatus] = tasks.filter(t => t._id !== taskId);
    
    // Add to new status
    const toTasks = tasksByStatus[toStatus] || [];
    const updatedTask = { ...task, status: toStatus };
    newTasksByStatus[toStatus] = [
      ...toTasks.slice(0, toIndex),
      updatedTask,
      ...toTasks.slice(toIndex),
    ];

    // Update position for all tasks in the new status
    const updatedTasks = newTasksByStatus[toStatus].map((t, index) => ({
      ...t,
      position: index,
    }));
    newTasksByStatus[toStatus] = updatedTasks;

    // Dispatch to Redux (optimistic update)
    dispatch(updateTaskPosition({
      taskId,
      status: toStatus,
      position: toIndex,
    }));

    // Actual API call
    try {
      await fetch('/api/tasks/position', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ taskId, status: toStatus, position: toIndex }),
      });
    } catch (error) {
     // console.error('Failed to update task position:', error);
    toast.error(error.message || 'Failed to update task');
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  if (isLoading) return <Loading />;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📊 Board</h1>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
            + Add Task
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id] || []}
              onTaskMove={handleTaskMove}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>

        {isModalOpen && (
          <TaskModal
            task={selectedTask}
            onClose={handleCloseModal}
            onUpdate={() => {
              dispatch(fetchTasksByStatus());
            }}
          />
        )}
      </div>
    </DndProvider>
  );
}