import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskAPI } from '../../api/tasks';
import toast from 'react-hot-toast';

const initialState = {
  tasks: [],
  tasksByStatus: {
    todo: [],
    'in-progress': [],
    review: [],
    done: [],
  },
  currentTask: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 0,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchTasksByStatus = createAsyncThunk(
  'tasks/fetchByStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getByStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getById(id);
     // console.log(response)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await taskAPI.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// ✅ Update task position (Drag & Drop)
export const updateTaskPosition = createAsyncThunk(
  'tasks/updatePosition',
  async ({ taskId, status, position }, { rejectWithValue }) => {
    try {
     // console.log('📦 updateTaskPosition called:', { taskId, status, position });
      
      // ✅ Make sure we're sending the right data
      const payload = {
        taskId: taskId,
        status: status,
        position: typeof position === 'number' ? position : 0
      };
      
      const response = await taskAPI.updatePosition(payload);
      return response.data;
    } catch (error) {
    //  console.error('❌ updateTaskPosition error:', error);
     // console.error('❌ Error response:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await taskAPI.delete(id);
      return { id };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ id, text }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.addComment(id, text);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const uploadAttachment = createAsyncThunk(
  'tasks/uploadAttachment',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.uploadAttachment(id, file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    optimisticUpdateTask: (state, action) => {
      const { id, status, position } = action.payload;
      // Find task in any status
      for (const [key, tasks] of Object.entries(state.tasksByStatus)) {
        const index = tasks.findIndex(t => t._id === id);
        if (index !== -1) {
          const task = tasks[index];
          if (key !== status) {
            state.tasksByStatus[key] = tasks.filter(t => t._id !== id);
          }
          task.status = status;
          task.position = position;
          if (!state.tasksByStatus[status]) {
            state.tasksByStatus[status] = [];
          }
          state.tasksByStatus[status] = [
            ...state.tasksByStatus[status].slice(0, position),
            task,
            ...state.tasksByStatus[status].slice(position),
          ];
          break;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
        toast.error(state.error);
      })
      .addCase(fetchTasksByStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTasksByStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasksByStatus = action.payload.tasks || {
          todo: [],
          'in-progress': [],
          review: [],
          done: [],
        };
      })
      .addCase(fetchTasksByStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
        toast.error(state.error);
      })
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload.task;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
        toast.error(state.error);
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const task = action.payload.task;
        state.tasksByStatus[task.status] = [
          task,
          ...state.tasksByStatus[task.status],
        ];
        toast.success('Task created!');
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const task = action.payload.task;
        // Update in all statuses
        for (const [key, tasks] of Object.entries(state.tasksByStatus)) {
          const index = tasks.findIndex(t => t._id === task._id);
          if (index !== -1) {
            if (key !== task.status) {
              state.tasksByStatus[key] = tasks.filter(t => t._id !== task._id);
            } else {
              state.tasksByStatus[key][index] = task;
            }
          }
        }
        if (!state.tasksByStatus[task.status]) {
          state.tasksByStatus[task.status] = [];
        }
        const existing = state.tasksByStatus[task.status].find(t => t._id === task._id);
        if (!existing) {
          state.tasksByStatus[task.status].push(task);
        }
        state.currentTask = task;
        toast.success('Task updated!');
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const id = action.payload.id;
        for (const [key, tasks] of Object.entries(state.tasksByStatus)) {
          state.tasksByStatus[key] = tasks.filter(t => t._id !== id);
        }
        toast.success('Task deleted!');
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.currentTask = action.payload.task;
      })
      .addCase(uploadAttachment.fulfilled, (state, action) => {
        state.currentTask = action.payload.task;
      });
  },
});

export const { clearCurrentTask, setPage, optimisticUpdateTask } = taskSlice.actions;
export default taskSlice.reducer;