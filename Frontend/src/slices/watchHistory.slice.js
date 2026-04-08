import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Relative URL — works in both dev and production
const API_URL = "http://localhost:8000/api/v1/watch/history";

// ✅ Fetch watch history (paginated)
export const fetchWatchHistory = createAsyncThunk(
  "watchHistory/fetchWatchHistory",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch watch history"
      );
    }
  }
);

// ✅ Delete all watch history
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

// ✅ Delete a single history item by ID
export const deleteWatchHistoryById = createAsyncThunk(
  "watchHistory/deleteWatchHistoryById",
  async (historyId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${historyId}`, {
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
      // ── Fetch Watch History ──────────────────────────────────
      .addCase(fetchWatchHistory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWatchHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.historyItems = action.payload.data.watchHistory;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchWatchHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ── Delete All Watch History ─────────────────────────────
      .addCase(deleteAllWatchHistory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteAllWatchHistory.fulfilled, (state) => {
        state.status = "succeeded";
        state.historyItems = [];
        state.pagination = null;
      })
      .addCase(deleteAllWatchHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ── Delete Single History Item ───────────────────────────
      .addCase(deleteWatchHistoryById.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteWatchHistoryById.fulfilled, (state, action) => {
        state.historyItems = state.historyItems.filter(
          (item) => item._id !== action.payload
        );
      })
      .addCase(deleteWatchHistoryById.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearHistoryState } = watchHistorySlice.actions;
export default watchHistorySlice.reducer;