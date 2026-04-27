import API from "../utils/API.js";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


export const getVideoViews = createAsyncThunk(
  "videoView/getVideoViews",
  async (videoId, { rejectWithValue }) => {
    try {
      const res = await API.get(
        `/views/video/${videoId}`,
        { withCredentials: true }
      );
      return res.data.data.views;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch views");
    }
  }
);

export const addVideoView = createAsyncThunk(
  "videoView/addVideoView",
  async (videoId, { rejectWithValue }) => {
    try {
      const res = await API.post(
        `/views/video/${videoId}`,
        {},                          // body empty
        { withCredentials: true }    // ✅ 3rd argument এ config
      );
      return res.data.data.alreadyViewed;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add view");
    }
  }
);

const VideoViewSlice = createSlice({
  name: "videoView",  // ✅ fixed
  initialState: {
    views: 0,
    loading: false,
    error: null,
  },
  reducers: {
    updateVideoViews: (state, action) => {
      state.views = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getVideoViews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVideoViews.fulfilled, (state, action) => {
        state.loading = false;
        state.views = action.payload;
      })
      .addCase(getVideoViews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addVideoView.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVideoView.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addVideoView.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateVideoViews } = VideoViewSlice.actions;
export default VideoViewSlice.reducer;