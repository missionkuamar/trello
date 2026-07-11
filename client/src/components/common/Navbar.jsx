import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

export default function Navbar() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // ✅ Role checks
    const isAdmin = user?.role === 'admin';
    const isModerator = user?.role === 'moderator';
    const isUser = user?.role === 'user';
    const hasAdminAccess = isAdmin || isModerator;

    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-primary-600">
                        📋 TaskFlow
                    </Link>

                    <div className="flex items-center space-x-6">
                        {isAuthenticated ? (
                            <>
                                {/* ✅ Common for all roles */}
                                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
                                    Dashboard
                                </Link>
                                <Link to="/board" className="text-gray-700 hover:text-primary-600">
                                    📊 Board
                                </Link>

                                {/* ✅ Admin Dropdown - Only for Admin */}
                                {isAdmin && (
                                    <div className="relative group">
                                        <button className="text-gray-700 hover:text-primary-600 flex items-center gap-1">
                                            ⚙️ Admin <span className="text-xs">▼</span>
                                        </button>
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out">
                                            <Link to="/admin/users" className="block px-4 py-2 hover:bg-gray-50">
                                                👥 Users
                                            </Link>
                                            <Link to="/admin/tasks" className="block px-4 py-2 hover:bg-gray-50">
                                                📋 Tasks
                                            </Link>
                                            <Link to="/admin/boards" className="block px-4 py-2 hover:bg-gray-50">
                                                📊 Boards
                                            </Link>
                                            <Link to="/admin/stats" className="block px-4 py-2 hover:bg-gray-50 border-t border-gray-100">
                                                📈 Stats
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* ✅ Moderator Dropdown - Only for Moderator */}
                                {isModerator && (
                                    <div className="relative group">
                                        <button className="text-gray-700 hover:text-primary-600 flex items-center gap-1">
                                            🛠️ Moderator <span className="text-xs">▼</span>
                                        </button>
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out">
                                            <Link to="/moderator/tasks" className="block px-4 py-2 hover:bg-gray-50">
                                                📋 All Tasks
                                            </Link>
                                            <Link to="/moderator/users" className="block px-4 py-2 hover:bg-gray-50">
                                                👥 Users
                                            </Link>
                                            <Link to="/moderator/reports" className="block px-4 py-2 hover:bg-gray-50">
                                                📊 Reports
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* ✅ User Dropdown - Only for User */}
                                {isUser && (
                                    <div className="relative group">
                                        <button className="text-gray-700 hover:text-primary-600 flex items-center gap-1">
                                            👤 My Account <span className="text-xs">▼</span>
                                        </button>
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out">
                                            <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50">
                                                👤 Profile
                                            </Link>
                                            <Link to="/my-tasks" className="block px-4 py-2 hover:bg-gray-50">
                                                📋 My Tasks
                                            </Link>
                                            <Link to="/settings" className="block px-4 py-2 hover:bg-gray-50">
                                                ⚙️ Settings
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* ✅ Profile Icon - Clickable */}
                                <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <span className="hidden md:inline">{user?.name}</span>
                                </Link>

                                {/* ✅ Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            // ✅ Not Authenticated
                            <div className="space-x-4">
                                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}