import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { boardAPI } from '../../api/board';
import toast from 'react-hot-toast';

const initialState = {
  boards: [],
  currentBoard: null,
  boardTasks: {
    todo: [],
    'in-progress': [],
    review: [],
    done: [],
  },
  columns: [],
  isLoading: false,
  error: null,
};

export const fetchBoards = createAsyncThunk(
  'boards/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await boardAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchBoardById = createAsyncThunk(
  'boards/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await boardAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await boardAPI.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateBoard = createAsyncThunk(
  'boards/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await boardAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/delete',
  async (id, { rejectWithValue }) => {
    try {
      await boardAPI.delete(id);
      return { id };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const addBoardMember = createAsyncThunk(
  'boards/addMember',
  async ({ id, userId, role }, { rejectWithValue }) => {
    try {
      const response = await boardAPI.addMember(id, userId, role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const removeBoardMember = createAsyncThunk(
  'boards/removeMember',
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const response = await boardAPI.removeMember(id, userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchBoardTasks = createAsyncThunk(
  'boards/fetchTasks',
  async (id, { rejectWithValue }) => {
    try {
      const response = await boardAPI.getTasks(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const boardSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
    },
    clearBoardTasks: (state) => {
      state.boardTasks = {
        todo: [],
        'in-progress': [],
        review: [],
        done: [],
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boards = action.payload.boards;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
        toast.error(state.error);
      })
      .addCase(fetchBoardById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBoard = action.payload.board;
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
        toast.error(state.error);
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.unshift(action.payload.board);
        toast.success('Board created!');
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        const index = state.boards.findIndex(b => b._id === action.payload.board._id);
        if (index !== -1) {
          state.boards[index] = action.payload.board;
        }
        state.currentBoard = action.payload.board;
        toast.success('Board updated!');
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter(b => b._id !== action.payload.id);
        toast.success('Board deleted!');
      })
      .addCase(fetchBoardTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBoardTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boardTasks = action.payload.tasks;
        state.columns = action.payload.columns;
      })
      .addCase(fetchBoardTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
        toast.error(state.error);
      });
  },
});

export const { clearCurrentBoard, clearBoardTasks } = boardSlice.actions;
export default boardSlice.reducer;