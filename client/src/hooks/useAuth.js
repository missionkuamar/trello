import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator' || user?.role === 'admin',
    isUser: user?.role === 'user',
  };
};