import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../../redux/slices/taskSlice';
import { getAllUsers } from '../../redux/slices/authSlice';
import Loading from '../../components/common/Loading';

export default function ModeratorReports() {
  const dispatch = useDispatch();
  const { tasks, isLoading } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.auth);
  const [selectedUser, setSelectedUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    dispatch(fetchTasks({ limit: 1000 }));
    dispatch(getAllUsers({ limit: 100 }));
  }, [dispatch]);

  if (isLoading) return <Loading />;

  // Filter tasks
  let filteredTasks = tasks;
  if (selectedUser) {
    filteredTasks = filteredTasks.filter(t => t.assignedTo?._id === selectedUser);
  }
  if (startDate) {
    filteredTasks = filteredTasks.filter(t => new Date(t.createdAt) >= new Date(startDate));
  }
  if (endDate) {
    filteredTasks = filteredTasks.filter(t => new Date(t.createdAt) <= new Date(endDate));
  }

  // Calculate stats
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'done').length;
  const pendingTasks = filteredTasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress').length;
  const reviewTasks = filteredTasks.filter(t => t.status === 'review').length;

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: '📋', color: 'bg-blue-500' },
    { label: 'Completed', value: completedTasks, icon: '✅', color: 'bg-green-500' },
    { label: 'Pending', value: pendingTasks, icon: '⏳', color: 'bg-yellow-500' },
    { label: 'In Progress', value: inProgressTasks, icon: '🔄', color: 'bg-purple-500' },
    { label: 'Review', value: reviewTasks, icon: '👀', color: 'bg-orange-500' },
  ];

  // Tasks by priority
  const priorityStats = {
    low: filteredTasks.filter(t => t.priority === 'low').length,
    medium: filteredTasks.filter(t => t.priority === 'medium').length,
    high: filteredTasks.filter(t => t.priority === 'high').length,
    urgent: filteredTasks.filter(t => t.priority === 'urgent').length,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">📊 Reports</h1>
          <p className="text-sm text-gray-500">Moderator view - Analytics and reports</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Users</option>
              {users?.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, index) => (
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

      {/* Priority Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>🟢 Low</span>
                <span>{priorityStats.low}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${totalTasks ? (priorityStats.low / totalTasks) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>🟡 Medium</span>
                <span>{priorityStats.medium}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${totalTasks ? (priorityStats.medium / totalTasks) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>🟠 High</span>
                <span>{priorityStats.high}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${totalTasks ? (priorityStats.high / totalTasks) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>🔴 Urgent</span>
                <span>{priorityStats.urgent}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalTasks ? (priorityStats.urgent / totalTasks) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>📋 To Do</span>
              <span className="font-medium">{pendingTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>🔄 In Progress</span>
              <span className="font-medium">{inProgressTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>👀 Review</span>
              <span className="font-medium">{reviewTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>✅ Completed</span>
              <span className="font-medium">{completedTasks}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between items-center font-bold">
              <span>Total</span>
              <span>{totalTasks}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}