import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBoards,
  fetchBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  addBoardMember,
  removeBoardMember,
  fetchBoardTasks,
} from '../redux/slices/boardSlice';
import toast from 'react-hot-toast';

export const useBoard = () => {
  const dispatch = useDispatch();
  const { boards, currentBoard, boardTasks, isLoading } = useSelector((state) => state.boards);

  const getAllBoards = useCallback(() => {
    return dispatch(fetchBoards());
  }, [dispatch]);

  const getBoardById = useCallback((id) => {
    return dispatch(fetchBoardById(id));
  }, [dispatch]);

  const createNewBoard = useCallback(async (data) => {
    try {
      await dispatch(createBoard(data)).unwrap();
      toast.success('Board created successfully!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to create board');
      return false;
    }
  }, [dispatch]);

  const updateExistingBoard = useCallback(async (id, data) => {
    try {
      await dispatch(updateBoard({ id, data })).unwrap();
      toast.success('Board updated successfully!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to update board');
      return false;
    }
  }, [dispatch]);

  const deleteExistingBoard = useCallback(async (id) => {
    try {
      await dispatch(deleteBoard(id)).unwrap();
      toast.success('Board deleted successfully!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to delete board');
      return false;
    }
  }, [dispatch]);

  const getBoardTasks = useCallback((id) => {
    return dispatch(fetchBoardTasks(id));
  }, [dispatch]);

  return {
    boards,
    currentBoard,
    boardTasks,
    isLoading,
    getAllBoards,
    getBoardById,
    createNewBoard,
    updateExistingBoard,
    deleteExistingBoard,
    getBoardTasks,
  };
};