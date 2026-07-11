import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../redux/slices/authSlice';
import { fetchTasks } from '../../redux/slices/taskSlice';
import { fetchBoards } from '../../redux/slices/boardSlice';
import Loading from '../../components/common/Loading';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks } = useSelector((state) => state.tasks);
  const { boards } = useSelector((state) => state.boards);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        dispatch(getCurrentUser()),
        dispatch(fetchTasks({ limit: 100 })),
        dispatch(fetchBoards()),
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [dispatch]);

  if (isLoading) return <Loading />;

  const stats = [
    { label: 'Total Users', value: 0, icon: '👥', color: 'bg-blue-500' },
    { label: 'Total Tasks', value: tasks.length, icon: '📋', color: 'bg-green-500' },
    { label: 'Total Boards', value: boards.length, icon: '📊', color: 'bg-purple-500' },
    { label: 'Completed Tasks', value: tasks.filter(t => t.status === 'done').length, icon: '✅', color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome, {user?.name} 👋
        </div>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/users" className="block bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 text-center">
              👥 Manage Users
            </Link>
            <Link to="/admin/tasks" className="block bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 text-center">
              📋 Manage Tasks
            </Link>
            <Link to="/admin/boards" className="block bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 text-center">
              📊 Manage Boards
            </Link>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Tasks</h2>
          {tasks.slice(0, 5).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks</p>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task._id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm font-medium">{task.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'done' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Boards */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Boards</h2>
          {boards.slice(0, 5).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No boards</p>
          ) : (
            <div className="space-y-3">
              {boards.slice(0, 5).map((board) => (
                <div key={board._id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm font-medium">{board.name}</span>
                  <span className="text-xs text-gray-500">{board.members?.length || 0} members</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}