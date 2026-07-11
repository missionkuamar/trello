import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
//import { store } from './redux/store';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import Tasks from './pages/Tasks'; // ✅ Import Tasks
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminTasks from './pages/Admin/AdminTasks';
import AdminBoards from './pages/Admin/AdminBoards';
import './index.css';
import CreateTask from './components/task/CreateTask ';
import EditTask from './components/task/EditTask';
import TaskDetail from './components/task/TaskDetail';
import TaskModal from './components/board/TaskModal';
import Profile from './pages/Profile';
import ModeratorTasks from './pages/Moderator/ModeratorTasks';
import ModeratorUsers from './pages/Moderator/ModeratorUsers';
import ModeratorReports from './pages/Moderator/ModeratorReports';
import ModeratorCreateTask from './pages/Moderator/ModeratorCreateTask';
import AdminStats from './pages/Admin/AdminStats';

function App() {
  return (
    
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
              <Route path="/board/:id" element={<ProtectedRoute><Board /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} /> {/* ✅ Add Tasks Route */}
              <Route path="/tasks/create" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
              <Route path="/tasks/edit/:id" element={<ProtectedRoute><EditTask /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/tasks" element={<ProtectedRoute adminOnly><AdminTasks /></ProtectedRoute>} />
              <Route path="/admin/boards" element={<ProtectedRoute adminOnly><AdminBoards /></ProtectedRoute>} />
              <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
              <Route path='task/modal/:id' element={<ProtectedRoute><TaskModal /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/moderator/create" element={<ProtectedRoute><ModeratorCreateTask /></ProtectedRoute>} />
<Route path="/moderator/tasks" element={<ProtectedRoute><ModeratorTasks /></ProtectedRoute>} />
<Route path="/moderator/users" element={<ProtectedRoute><ModeratorUsers /></ProtectedRoute>} />
<Route path="/moderator/reports" element={<ProtectedRoute><ModeratorReports /></ProtectedRoute>} />

// ✅ Add this route
<Route path="/admin/stats" element={<ProtectedRoute adminOnly><AdminStats /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    
  );
}

export default App;