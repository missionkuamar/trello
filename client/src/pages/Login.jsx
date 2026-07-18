import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, resetLoading } from '../redux/slices/authSlice';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token, isLoading, isAuthenticated, error } = useSelector((state) => {
   // console.log('🔍 Redux State in Component:', state.auth);
    return state.auth;
  });

  // ✅ Check if login success
  useEffect(() => {
    if (isAuthenticated && user && token) {
      //console.log('✅ Login successful! Navigating to dashboard...');
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, token, navigate]);

  // ✅ Reset loading on unmount
  useEffect(() => {
    return () => {
      dispatch(resetLoading());
    };
  }, [dispatch]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
   // console.log('🔄 Login form submitted');
    
    try {
      const result = await dispatch(loginUser({ email, password }));
     // console.log('📤 Dispatch Result:', result);
      
      // ✅ Check if login successful
      if (result.payload?.token) {
       // console.log('✅ Token received:', result.payload.token);
        navigate('/dashboard');
      } else {
      //  console.log('❌ No token in response');
      toast.error(error.message || 'Failed to update task');
      }
    } catch (error) {
     // console.error('❌ Login error:', error);
     toast.error(error.message || 'Failed to update task');
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* ✅ Debug Info */}
        <div className="bg-gray-100 p-2 mb-4 text-xs rounded">
          <p>Token: {token ? '✅ Present' : '❌ Missing'}</p>
          <p>User: {user?.name || '❌ No user'}</p>
          <p>Auth: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          {error && <p className="text-red-500">Error: {error}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}