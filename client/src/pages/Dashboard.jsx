import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTasks } from '../redux/slices/taskSlice';
import { fetchBoards } from '../redux/slices/boardSlice';
import RecentTasks from '../components/dashboard/RecentTasks';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { tasks, isLoading } = useSelector((state) => state.tasks);
  const { boards } = useSelector((state) => state.boards);
  const { user } = useAuth();

  useEffect(() => {
    dispatch(fetchTasks({ limit: 100 }));
    dispatch(fetchBoards());
  }, [dispatch]);

  if (isLoading) return <Loading />;

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: '📋', color: 'bg-blue-500' },
    { label: 'Pending', value: tasks.filter(t => t.status === 'todo').length, icon: '⏳', color: 'bg-yellow-500' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, icon: '🔄', color: 'bg-purple-500' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'done').length, icon: '✅', color: 'bg-green-500' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            to="/board"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            📊 Board View
          </Link>
          <Link
            to="/tasks/create"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + New Task
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ✅ Recent Tasks Component */}
        <RecentTasks tasks={tasks} limit={5} />

        {/* My Boards */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">My Boards</h2>
            <Link to="/board" className="text-sm text-primary-600 hover:underline">
              View All →
            </Link>
          </div>

          {boards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>No boards yet</p>
              <Link to="/board" className="text-primary-600 hover:underline text-sm">
                Create your first board
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {boards.slice(0, 5).map((board) => (
                <div key={board._id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <p className="font-medium text-gray-900">{board.name}</p>
                    <p className="text-xs text-gray-500">
                      {board.members?.length || 0} members • {new Date(board.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/board/${board._id}`}
                    className="text-primary-600 hover:underline text-sm"
                  >
                    Open →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}