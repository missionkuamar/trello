import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateTaskPosition } from '../redux/slices/taskSlice';

export const useDragDrop = () => {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((e, taskId, status) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('fromStatus', status);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e, toStatus, toIndex) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const fromStatus = e.dataTransfer.getData('fromStatus');

    if (fromStatus !== toStatus && taskId) {
      dispatch(updateTaskPosition({
        taskId,
        status: toStatus,
        position: toIndex,
      }));
    }
    setIsDragging(false);
  }, [dispatch]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  return {
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleDragOver,
  };
};