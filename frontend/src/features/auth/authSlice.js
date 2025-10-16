import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api";


const setAuthToken = (token) => {
  if (token) {
  
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};


const tokenFromStorage = localStorage.getItem("token");

const initialState = {
  user: localStorage.getItem("user_id") || null,
  role: localStorage.getItem("role") || null,
  token: tokenFromStorage || null,
  status: "idle", 
  error: null,
};


if (tokenFromStorage) {
  setAuthToken(tokenFromStorage);
}


export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post("/auth/login", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.msg || "Login failed");
    }
  }
);


export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post("/auth/register", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.msg || "Registration failed");
    }
  }
);

export const logoutUserAsync = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {

      await API.logoutUser();

    
      dispatch(logout());

      return "Logout successful";
    } catch (error) {
      
      console.warn(
        "Backend logout failed, proceeding with local logout.",
        error
      );
      dispatch(logout());
      return rejectWithValue("Backend logout failed.");
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    
    logout: (state) => {
      localStorage.clear();
      state.user = null;
    
      setAuthToken(null);
      state.role = null;
      state.token = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.access_token;
        state.user = action.payload.user_id;
        state.role = action.payload.role;
        
        localStorage.setItem("token", action.payload.access_token);
        localStorage.setItem("user_id", action.payload.user_id);
        localStorage.setItem("role", action.payload.role);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.access_token;
        
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
