import express from 'express';
import {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember,
  getBoardTasks,
} from '../controllers/boardController.js';
import { verifyToken, isAdmin, isModerator } from '../middleware/auth.js';

const router = express.Router();

// ✅ All routes require authentication
router.use(verifyToken);

// ✅ Board CRUD
router.get('/', getBoards);
router.get('/:id', getBoardById);
router.post('/', createBoard);
router.put('/:id', updateBoard);
router.delete('/:id', isAdmin, deleteBoard);

// ✅ Board members
router.post('/:id/members', isModerator, addMember);
router.delete('/:id/members/:userId', isModerator, removeMember);

// ✅ Board tasks
router.get('/:id/tasks', getBoardTasks);

export default router;