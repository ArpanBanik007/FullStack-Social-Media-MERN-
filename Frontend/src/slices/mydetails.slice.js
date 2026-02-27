// src/slices/mydetails.slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Fetch my details
export const fetchMydetils = createAsyncThunk(
  "user/fetchMyDetails",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/users/current-user", {
        withCredentials: true,
      });
      return res.data?.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const myDetailsSlice = createSlice({
  name: "mydetails",
  initialState: {
    mydetails: {},
    loading: false,
    error: null,
  },
  reducers: {
    // 🧹 Reset when logout
    resetMyDetails: (state) => {
      state.mydetails = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMydetils.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMydetils.fulfilled, (state, action) => {
        state.loading = false;
        state.mydetails = action.payload || {};
      })
      .addCase(fetchMydetils.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { resetMyDetails } = myDetailsSlice.actions;
export default myDetailsSlice.reducer;
