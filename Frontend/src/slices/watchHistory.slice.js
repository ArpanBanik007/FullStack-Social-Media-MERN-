import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API Base URL
const API_URL = "http://localhost:8000/api/v1/watch/history";

export const fetchWatchHistory = createAsyncThunk(
  "watchHistory/fetchWatchHistory",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch watch history"
      );
    }
  }
);

export const deleteAllWatchHistory = createAsyncThunk(
  "watchHistory/deleteAllWatchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/all`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete all watch history"
      );
    }
  }
);

export const deleteWatchHistoryById = createAsyncThunk(
  "watchHistory/deleteWatchHistoryById",
  async (historyId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/${historyId}`, {
        withCredentials: true,
      });
      return historyId; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete watch history item"
      );
    }
  }
);

const watchHistorySlice = createSlice({
  name: "watchHistory",
  initialState: {
    historyItems: [],
    pagination: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearHistoryState: (state) => {
      state.historyItems = [];
      state.pagination = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Watch History
      .addCase(fetchWatchHistory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWatchHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        // If it's a new fetch or different page, we might want to append or replace.
        // Assuming we replace for simple pagination or infinite scroll is not implemented yet.
        state.historyItems = action.payload.data.watchHistory;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchWatchHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete All Watch History
      .addCase(deleteAllWatchHistory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteAllWatchHistory.fulfilled, (state) => {
        state.status = "succeeded";
        state.historyItems = [];
      })
      .addCase(deleteAllWatchHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete Watch History Item
      .addCase(deleteWatchHistoryById.fulfilled, (state, action) => {
        state.historyItems = state.historyItems.filter(
          (item) => item._id !== action.payload
        );
      });
  },
});

export const { clearHistoryState } = watchHistorySlice.actions;

export default watchHistorySlice.reducer;
