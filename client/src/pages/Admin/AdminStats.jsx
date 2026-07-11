import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../../redux/slices/taskSlice';
import { getAllUsers } from '../../redux/slices/authSlice';
import { fetchBoards } from '../../redux/slices/boardSlice';
import Loading from '../../components/common/Loading';
import { Link } from 'react-router-dom';

export default function AdminStats() {
  const dispatch = useDispatch();
  const { tasks, isLoading: tasksLoading } = useSelector((state) => state.tasks);
  const { users, isLoading: usersLoading } = useSelector((state) => state.auth);
  const { boards, isLoading: boardsLoading } = useSelector((state) => state.boards);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    reviewTasks: 0,
    totalUsers: 0,
    totalBoards: 0,
    tasksByPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
    tasksByCategory: {},
    tasksByUser: [],
    completionRate: 0,
  });

  useEffect(() => {
    dispatch(fetchTasks({ limit: 1000 }));
    dispatch(getAllUsers({ limit: 100 }));
    dispatch(fetchBoards());
  }, [dispatch]);

  useEffect(() => {
    if (tasks.length > 0 && users.length > 0) {
      calculateStats();
    }
  }, [tasks, users, boards]);

  const calculateStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const pendingTasks = tasks.filter(t => t.status === 'todo').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const reviewTasks = tasks.filter(t => t.status === 'review').length;

    // Priority stats
    const tasksByPriority = {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length,
    };

    // Category stats
    const tasksByCategory = {};
    tasks.forEach(task => {
      const cat = task.category || 'uncategorized';
      tasksByCategory[cat] = (tasksByCategory[cat] || 0) + 1;
    });

    // User stats
    const tasksByUser = users.map(user => ({
      ...user,
      taskCount: tasks.filter(t => t.assignedTo?._id === user._id || t.assignedTo === user._id).length,
      completedCount: tasks.filter(t => 
        (t.assignedTo?._id === user._id || t.assignedTo === user._id) && t.status === 'done'
      ).length,
    })).sort((a, b) => b.taskCount - a.taskCount);

    // Completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    setStats({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      reviewTasks,
      totalUsers: users.length,
      totalBoards: boards.length,
      tasksByPriority,
      tasksByCategory,
      tasksByUser,
      completionRate,
    });
  };

  const isLoading = tasksLoading || usersLoading || boardsLoading;

  if (isLoading) return <Loading />;

  const statusCards = [
    { label: 'Total Tasks', value: stats.totalTasks, icon: '📋', color: 'bg-blue-500' },
    { label: 'Completed', value: stats.completedTasks, icon: '✅', color: 'bg-green-500' },
    { label: 'Pending', value: stats.pendingTasks, icon: '⏳', color: 'bg-yellow-500' },
    { label: 'In Progress', value: stats.inProgressTasks, icon: '🔄', color: 'bg-purple-500' },
    { label: 'Review', value: stats.reviewTasks, icon: '👀', color: 'bg-orange-500' },
    { label: 'Completion Rate', value: `${stats.completionRate.toFixed(1)}%`, icon: '📊', color: 'bg-indigo-500' },
  ];

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">📈 Statistics</h1>
          <p className="text-sm text-gray-500">Overview of your task management system</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
            ← Back to Dashboard
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statusCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white w-10 h-10 rounded-full flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.tasksByPriority).map(([priority, count]) => (
              <div key={priority}>
                <div className="flex justify-between text-sm">
                  <span className="capitalize">
                    {priority === 'low' ? '🟢' : priority === 'medium' ? '🟡' : priority === 'high' ? '🟠' : '🔴'} {priority}
                  </span>
                  <span>{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`${priorityColors[priority]} h-2 rounded-full transition-all`}
                    style={{ width: `${stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Tasks</span>
              <span>{stats.totalTasks}</span>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          {Object.keys(stats.tasksByCategory).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No categories found</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.tasksByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">
                        {category === 'personal' ? '👤' : category === 'work' ? '💼' : category === 'study' ? '📚' : category === 'health' ? '💪' : '📌'} {category}
                      </span>
                      <span>{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* User Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">User Performance</h3>
          {stats.tasksByUser.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No users found</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {stats.tasksByUser.slice(0, 10).map((user, index) => (
                <div key={user._id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-semibold">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{user.taskCount} tasks</span>
                    <span className={`${user.completedCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      ✅ {user.completedCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.totalBoards}</p>
              <p className="text-sm text-gray-500">Total Boards</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalTasks > 0 ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-500">Completion Rate</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
              <p className="text-sm text-gray-500">Pending Tasks</p>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Status Distribution</h4>
            <div className="flex h-4 rounded-full overflow-hidden">
              {stats.totalTasks > 0 && (
                <>
                  <div
                    className="bg-yellow-500 transition-all"
                    style={{ width: `${(stats.pendingTasks / stats.totalTasks) * 100}%` }}
                    title={`Pending: ${stats.pendingTasks}`}
                  />
                  <div
                    className="bg-blue-500 transition-all"
                    style={{ width: `${(stats.inProgressTasks / stats.totalTasks) * 100}%` }}
                    title={`In Progress: ${stats.inProgressTasks}`}
                  />
                  <div
                    className="bg-purple-500 transition-all"
                    style={{ width: `${(stats.reviewTasks / stats.totalTasks) * 100}%` }}
                    title={`Review: ${stats.reviewTasks}`}
                  />
                  <div
                    className="bg-green-500 transition-all"
                    style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
                    title={`Completed: ${stats.completedTasks}`}
                  />
                </>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Pending</span>
              <span>In Progress</span>
              <span>Review</span>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}