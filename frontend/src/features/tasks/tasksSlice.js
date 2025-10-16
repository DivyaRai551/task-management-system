import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api";

const initialState = {
  tasks: [],
  pagination: {},
  filters: { status: "", priority: "", sort: "-due_date", page: 1, limit: 10 },
  status: "idle", 
  error: null,
};


export const getTasks = createAsyncThunk(
  "tasks/getTasks",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.fetchTasks(filters);
      return response.data; 
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to fetch tasks."
      );
    }
  }
);


export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.createTask(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to create task."
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await api.updateTask(id, data);

      return { id, data };
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to update task."
      );
    }
  }
);


export const removeTask = createAsyncThunk(
  "tasks/removeTask",
  async (taskId, { rejectWithValue }) => {
    try {
      await api.deleteTask(taskId);
      return taskId; 
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to delete task."
      );
    }
  }
);


const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setFilters: (state, action) => {
       
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
     
      .addCase(getTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.tasks = [];
      })

    
      .addCase(updateTask.fulfilled, (state, action) => {
        state.status = "idle";
        const { id, data } = action.payload;

       
        const existingTaskIndex = state.tasks.findIndex(
          (task) => task._id === id
        );

        if (existingTaskIndex !== -1) {
          
          state.tasks[existingTaskIndex] = {
            ...state.tasks[existingTaskIndex],
            ...data,
          };
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;

      })
      
      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
        
      })
      .addCase(addTask.fulfilled, (state, action) => {

        state.status = "idle";
      });
  },
});

export const { setFilters, setPage } = tasksSlice.actions;
export default tasksSlice.reducer;
