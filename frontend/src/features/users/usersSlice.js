import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api";

const initialState = {
  users: [],
  status: "idle",
  error: null,
};



export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.fetchUsers();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to fetch users."
      );
    }
  }
);


export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      
      await api.updateUser(id, data);

    
      return { id, data };
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to update user."
      );
    }
  }
);

export const removeUser = createAsyncThunk(
  "users/removeUser",
  async (userId, { rejectWithValue }) => {
    try {
      await api.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to delete user."
      );
    }
  }
);



const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      .addCase(getUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
        state.error = null;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.users = [];
      })

      
      .addCase(updateUser.fulfilled, (state, action) => {
        const { id, data } = action.payload;

        
        const userIndex = state.users.findIndex((user) => user._id === id);

        if (userIndex !== -1) {
          state.users[userIndex] = {
            ...state.users[userIndex],
            ...data,
            
            password: state.users[userIndex].password,
          };
        }
        state.status = "succeeded"; 
      })

   
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
