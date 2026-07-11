import express from 'express';
import multer from 'multer';
import {
  getTasks,
  getTasksByStatus,
  getTaskById,
  createTask,
  updateTask,
  updateTaskPosition,
  deleteTask,
  uploadAttachment,
  addComment,
  assignTask,
} from '../controllers/taskController.js';
import { verifyToken, isAdmin, isModerator } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ All routes require authentication
router.use(verifyToken);

// ✅ IMPORTANT: Specific routes FIRST, then dynamic routes
router.get('/board', getTasksByStatus);           // ✅ Specific route
router.put('/position', updateTaskPosition);      // ✅ Specific route - MUST be BEFORE /:id
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', isAdmin, deleteTask);

// ✅ Task actions
router.post('/:id/attachments', upload.single('attachment'), uploadAttachment);
router.post('/:id/comments', addComment);
router.put('/:id/assign', isModerator, assignTask);

export default router;