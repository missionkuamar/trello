import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasks,
  fetchTasksByStatus,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  uploadAttachment,
} from '../redux/slices/taskSlice';
import toast from 'react-hot-toast';

export const useTask = () => {
  const dispatch = useDispatch();
  const { tasks, tasksByStatus, currentTask, isLoading } = useSelector((state) => state.tasks);

  const getAllTasks = useCallback((params) => {
    return dispatch(fetchTasks(params));
  }, [dispatch]);

  const getBoardTasks = useCallback(() => {
    return dispatch(fetchTasksByStatus());
  }, [dispatch]);

  const getTaskById = useCallback((id) => {
    return dispatch(fetchTaskById(id));
  }, [dispatch]);

  const createNewTask = useCallback(async (data) => {
    try {
      await dispatch(createTask(data)).unwrap();
      toast.success('Task created successfully!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to create task');
      return false;
    }
  }, [dispatch]);

  const updateExistingTask = useCallback(async (id, data) => {
    try {
      await dispatch(updateTask({ id, data })).unwrap();
      toast.success('Task updated successfully!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
      return false;
    }
  }, [dispatch]);

  const deleteExistingTask = useCallback(async (id) => {
    try {
      await dispatch(deleteTask(id)).unwrap();
      toast.success('Task deleted successfully!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to delete task');
      return false;
    }
  }, [dispatch]);

  const addCommentToTask = useCallback(async (id, text) => {
    try {
      await dispatch(addComment({ id, text })).unwrap();
      toast.success('Comment added!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to add comment');
      return false;
    }
  }, [dispatch]);

  const uploadTaskAttachment = useCallback(async (id, file) => {
    try {
      await dispatch(uploadAttachment({ id, file })).unwrap();
      toast.success('File uploaded successfully!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to upload file');
      return false;
    }
  }, [dispatch]);

  return {
    tasks,
    tasksByStatus,
    currentTask,
    isLoading,
    getAllTasks,
    getBoardTasks,
    getTaskById,
    createNewTask,
    updateExistingTask,
    deleteExistingTask,
    addCommentToTask,
    uploadTaskAttachment,
  };
};