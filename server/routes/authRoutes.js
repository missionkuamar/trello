import express from 'express';
import multer from 'multer';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  changePassword,
  logout,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from '../controllers/authController.js';
import { verifyToken, isAdmin, isModerator } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// ✅ Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, updateProfile);
router.put('/password', verifyToken, changePassword);
router.post('/avatar', verifyToken, upload.single('avatar'), uploadAvatar);

// ✅ Admin routes
router.get('/users', verifyToken, isModerator, getAllUsers);

router.put('/users/:id/role', verifyToken, isAdmin, updateUserRole);
router.put('/users/:id/status', verifyToken, isAdmin, toggleUserStatus);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);

export default router;