import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  fetchBoards, 
  fetchBoardById, 
  fetchBoardTasks, 
  createBoard, 
  updateBoard, 
  deleteBoard,
  clearCurrentBoard,
  clearBoardTasks
} from '../redux/slices/boardSlice';
import { updateTaskPosition } from '../redux/slices/taskSlice';
import Column from '../components/board/Column';
import TaskModal from '../components/board/TaskModal';
import AddTaskModal from '../components/board/AddTaskModal'; // ✅ Import AddTaskModal
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { boards, currentBoard, boardTasks, columns, isLoading } = useSelector((state) => state.boards);
  const { user, users } = useSelector((state) => state.auth);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false); // ✅ Add Task Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [editBoardName, setEditBoardName] = useState('');
  const [editBoardDescription, setEditBoardDescription] = useState('');

  // ✅ Filter users - only regular users (not admin/moderator)
  const regularUsers = users?.filter((u) => u.role === 'user') || [];

  // ✅ Load boards and tasks
  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(fetchBoardById(id));
      dispatch(fetchBoardTasks(id));
    } else {
      dispatch(clearCurrentBoard());
      dispatch(clearBoardTasks());
    }
    return () => {
      dispatch(clearCurrentBoard());
      dispatch(clearBoardTasks());
    };
  }, [dispatch, id]);

// ✅ Handle task move (Drag & Drop) - FIXED
const handleTaskMove = async (taskId, fromStatus, toStatus) => {
  try {
    // ✅ Don't allow move to same status
    if (fromStatus === toStatus) {
      //console.log('⏭️ Same status, skipping...');
      return;
    }

    // Get tasks from the target status
    const targetTasks = boardTasks[toStatus] || [];
    const position = targetTasks.length;

    //console.log('🔄 Moving task:', { taskId, fromStatus, toStatus, position });

    // ✅ Optimistic update - move task locally
    const taskToMove = boardTasks[fromStatus]?.find(t => t._id === taskId);
    if (taskToMove) {
      // Update local state
      const newBoardTasks = { ...boardTasks };
      
      // Remove from source
      newBoardTasks[fromStatus] = boardTasks[fromStatus].filter(t => t._id !== taskId);
      
      // Add to target with updated status
      const updatedTask = { ...taskToMove, status: toStatus };
      newBoardTasks[toStatus] = [...(boardTasks[toStatus] || []), updatedTask];
      
      // ✅ Update local state (optimistic)
      // We're using Redux state, so we'll just rely on the server response
    }

    // ✅ API call
    const result = await dispatch(updateTaskPosition({
      taskId: taskId,
      status: toStatus,
      position: position,
    })).unwrap();

    //console.log('✅ Task moved successfully:', result);
    
    // ✅ Refresh board tasks
    await dispatch(fetchBoardTasks(id));
    
    toast.success('Task moved successfully!');
  } catch (error) {
   // console.error('❌ Move task error:', error);
    toast.error(error.message || 'Failed to move task');
    // ✅ Refresh to fix any inconsistencies
    dispatch(fetchBoardTasks(id));
  }
};



  // ✅ Handle task click
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // ✅ Handle close task modal
  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    if (id) {
      dispatch(fetchBoardTasks(id));
    }
  };

  // ✅ Handle close add task modal
 const handleCloseAddTaskModal = () => {
  setIsAddTaskModalOpen(false);
  // ✅ Refresh board tasks immediately
  if (id) {
    setTimeout(() => {
      dispatch(fetchBoardTasks(id));
    }, 500);
  }
};

  // ✅ Handle create board
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) {
      toast.error('Please enter a board name');
      return;
    }

    try {
      await dispatch(createBoard({
        name: newBoardName,
        description: newBoardDescription,
      })).unwrap();
      
      toast.success('Board created successfully!');
      setIsCreateModalOpen(false);
      setNewBoardName('');
      setNewBoardDescription('');
      dispatch(fetchBoards());
    } catch (error) {
      toast.error(error.message || 'Failed to create board');
    }
  };

  // ✅ Handle update board
  const handleUpdateBoard = async (e) => {
    e.preventDefault();
    if (!editBoardName.trim()) {
      toast.error('Please enter a board name');
      return;
    }

    try {
      await dispatch(updateBoard({
        id: currentBoard._id,
        data: {
          name: editBoardName,
          description: editBoardDescription,
        },
      })).unwrap();
      
      toast.success('Board updated successfully!');
      setIsEditModalOpen(false);
      dispatch(fetchBoardById(id));
      dispatch(fetchBoards());
    } catch (error) {
      toast.error(error.message || 'Failed to update board');
    }
  };

  // ✅ Handle delete board
  const handleDeleteBoard = async () => {
    if (!window.confirm('Are you sure you want to delete this board? All tasks will be lost.')) {
      return;
    }

    try {
      await dispatch(deleteBoard(id)).unwrap();
      toast.success('Board deleted successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to delete board');
    }
  };

  // ✅ Handle board selection
  const handleBoardSelect = (boardId) => {
    navigate(`/board/${boardId}`);
  };

  // ✅ Check if user can edit board
  const canEditBoard = currentBoard && (
    user?.role === 'admin' || 
    currentBoard.createdBy?._id === user?.id ||
    currentBoard.members?.some(m => m.user?._id === user?.id && m.role === 'admin')
  );

  // ✅ Loading state
  if (isLoading) return <Loading />;

  // ✅ Board List View (when no board selected)
  if (!id) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📊 My Boards</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            + Create Board
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700">No Boards Yet</h3>
            <p className="text-gray-500 mt-2">Create your first board to get started</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Create Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board._id}
                onClick={() => handleBoardSelect(board._id)}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{board.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{board.description || 'No description'}</p>
                  </div>
                  <span className="text-2xl">📊</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {board.members?.length || 0} members
                  </span>
                  <span className="text-gray-400">
                    {new Date(board.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-3 flex -space-x-2">
                  {board.members?.slice(0, 5).map((member) => (
                    <div
                      key={member._id}
                      className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-semibold border-2 border-white"
                      title={member.user?.name}
                    >
                      {member.user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  ))}
                  {board.members?.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold border-2 border-white">
                      +{board.members.length - 5}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Board Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Create New Board</h2>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleCreateBoard}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Board Name *</label>
                      <input
                        type="text"
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="My Board"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={newBoardDescription}
                        onChange={(e) => setNewBoardDescription(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="What is this board about?"
                      />
                    </div>
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
                      >
                        Create Board
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ✅ Board View (when board is selected)
  if (!currentBoard) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-700">Board not found</h2>
        <Link to="/board" className="text-primary-600 hover:underline mt-4 inline-block">
          ← Back to Boards
        </Link>
      </div>
    );
  }

  // ✅ Set edit form values
  const openEditModal = () => {
    setEditBoardName(currentBoard.name);
    setEditBoardDescription(currentBoard.description || '');
    setIsEditModalOpen(true);
  };

  const columnConfig = [
    { id: 'todo', title: 'To Do', icon: '📋' },
    { id: 'in-progress', title: 'In Progress', icon: '🔄' },
    { id: 'review', title: 'Review', icon: '👀' },
    { id: 'done', title: 'Done', icon: '✅' },
  ];

  return (
    <div>
      {/* Board Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/board" className="text-gray-500 hover:text-gray-700">
              ←
            </Link>
            <h1 className="text-2xl font-bold">{currentBoard.name}</h1>
            {canEditBoard && (
              <button
                onClick={openEditModal}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✏️ Edit
              </button>
            )}
          </div>
          {currentBoard.description && (
            <p className="text-gray-500 mt-1">{currentBoard.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
            <span>👤 {currentBoard.createdBy?.name || 'Unknown'}</span>
            <span>📅 {new Date(currentBoard.createdAt).toLocaleDateString()}</span>
            <span>👥 {currentBoard.members?.length || 0} members</span>
          </div>
        </div>
        <div className="flex gap-2">
          {/* ✅ Add Task Button */}
          <button
            onClick={() => setIsAddTaskModalOpen(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            + Add Task
          </button>
          {canEditBoard && (
            <button
              onClick={handleDeleteBoard}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              🗑️ Delete Board
            </button>
          )}
        </div>
      </div>

      {/* Board Columns */}
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columnConfig.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={boardTasks[column.id] || []}
              onTaskMove={handleTaskMove}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>
      </DndProvider>

      {/* ✅ Add Task Modal */}
    <AddTaskModal
  isOpen={isAddTaskModalOpen}
  onClose={handleCloseAddTaskModal}
  onSuccess={() => {
    // ✅ Refresh tasks immediately
    if (id) {
      dispatch(fetchBoardTasks(id));
    }
  }}
  boardId={id}
/>

      {/* Edit Board Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Board</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdateBoard}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Board Name *</label>
                    <input
                      type="text"
                      value={editBoardName}
                      onChange={(e) => setEditBoardName(e.target.value)}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={editBoardDescription}
                      onChange={(e) => setEditBoardDescription(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
                    >
                      Update Board
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {isTaskModalOpen && (
        <TaskModal
          task={selectedTask}
          onClose={handleCloseTaskModal}
          onUpdate={() => {
            if (id) {
              dispatch(fetchBoardTasks(id));
            }
          }}
        />
      )}
    </div>
  );
}