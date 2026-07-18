import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';

// ============ INITIAL STATE ============
const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  users: [],
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(data);
      //console.log('📝 Register response:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(data);
     // console.log('🔵 API Response:', response.data);
      
      // ✅ Check response structure
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }
      
      return response.data;
    } catch (error) {
    //  console.error('❌ Login Error:', error);
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.uploadAvatar(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  'auth/getAllUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await authAPI.getAllUsers(params);
     // console.log(response)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'auth/updateUserRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateUserRole(id, role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'auth/toggleUserStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await authAPI.toggleUserStatus(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'auth/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await authAPI.deleteUser(id);
      return { id };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
       state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false; // ✅ Loading reset
      state.users = [];
      state.error = null;
      toast.success('Logged out successfully');
    },
    clearError: (state) => {
      state.error = null;
    },
     resetLoading: (state) => {
      state.isLoading = false;
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = !!token;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
  .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        //console.log('✅ Register fulfilled:', action.payload);
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        toast.success('Registration successful!');
      })
      .addCase(registerUser.rejected, (state, action) => {
       // console.log('❌ Register rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
        state.isAuthenticated = false;
        toast.error(state.error);
      })

      // ============ LOGIN ============
      .addCase(loginUser.pending, (state) => {
       // console.log('⏳ Login Pending...');
        state.isLoading = true;
        state.error = null;
        state.isAuthenticated = false; // ✅ Reset during login
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        //console.log('✅ Login Fulfilled - Payload:', action.payload);
        
        // ✅ IMPORTANT: Properly update state
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        
      ///  console.log('📊 Updated State:', {
        //   user: state.user?.name || state.user?.email || 'User',
        //   token: state.token?.substring(0, 20) + '...',
        //   isAuthenticated: state.isAuthenticated,
        //   isLoading: state.isLoading
        // });
        
        toast.success('Login successful!');
      })
      .addCase(loginUser.rejected, (state, action) => {
       // console.log('❌ Login Rejected:', action.payload);
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || 'Login failed';
        toast.error(state.error);
      })

       // ============ GET CURRENT USER ============
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
       // console.log('✅ Get current user fulfilled:', action.payload);
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
      //  console.log('❌ Get current user rejected:', action.payload);
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || 'Session expired';
      })
      
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        toast.success('Profile updated!');
      })
      // Change Password
      .addCase(changePassword.fulfilled, () => {
        toast.success('Password changed successfully!');
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to change password';
        toast.error(state.error);
      })
      // Upload Avatar
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.user.avatar = action.payload.avatar;
        localStorage.setItem('user', JSON.stringify(state.user));
        toast.success('Avatar updated!');
      })
      // ============ GET ALL USERS ============
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
      //  console.log('✅ Get all users fulfilled:', action.payload);
        state.isLoading = false;
        state.users = action.payload?.users || [];
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
       // console.log('❌ Get all users rejected:', action.payload);
        state.isLoading = false;
        state.users = [];
        state.error = action.payload?.message || 'Failed to fetch users';
        toast.error(state.error);
      })
      // Update User Role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        toast.success('User role updated!');
      })
      // Toggle User Status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        toast.success(`User ${action.payload.user.isActive ? 'activated' : 'deactivated'}`);
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        toast.success('User deleted!');
      });
  },
});

export const { logout, clearError, resetLoading, setCredentials } = authSlice.actions;
export default authSlice.reducer;