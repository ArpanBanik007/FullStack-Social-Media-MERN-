import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ── Fetch My Liked Videos ──
export const fetchMyVideoLikes = createAsyncThunk(
  "videoLikes/fetchMyVideoLikes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/likes/my-liked-videos",
        { withCredentials: true }
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Toggle Video Like ──
export const toggleVideoLike = createAsyncThunk(
  "videoLikes/toggleVideoLike",
  async (videoId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/videos/like/${videoId}`,
        {},
        { withCredentials: true }
      );
      
      console.log("res.data.data →", res.data.data); // ← এটা দেখাও একবার
      
      const liked = res.data?.data?.liked ?? res.data?.liked;
      return { videoId: String(videoId), liked };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
// ── Helper ──
const normalizeId = (id) => String(id ?? ""); 

const videoLikeSlice = createSlice({
  name: "videoLikes",
  initialState: {
    videos: [],
    totalLikes: 0,
    status: "idle",
    error: null,
  },
  reducers: {
    removeFromLikedVideos: (state, action) => {
      const id = normalizeId(action.payload);
      state.videos = state.videos.filter((v) => normalizeId(v._id) !== id);
      if (state.totalLikes > 0) state.totalLikes -= 1; // ✅ negative হবে না
    },
    clearLikedVideos: (state) => {
      state.videos = [];
      state.totalLikes = 0;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchMyVideoLikes ──
      .addCase(fetchMyVideoLikes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyVideoLikes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.videos = action.payload.videos ?? []; // ✅ undefined safety
        state.totalLikes = action.payload.totalLikes ?? 0;
      })
      .addCase(fetchMyVideoLikes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ── toggleVideoLike ──
      .addCase(toggleVideoLike.fulfilled, (state, action) => {
        const { videoId, liked } = action.payload; // videoId ইতিমধ্যে String

        if (liked) {
          const exists = state.videos.some(
            (v) => normalizeId(v._id) === videoId // ✅
          );
          if (!exists) {
            state.videos.push({ _id: videoId }); // ✅ String হিসেবে push
            state.totalLikes += 1;
          }
        } else {
          state.videos = state.videos.filter(
            (v) => normalizeId(v._id) !== videoId // ✅
          );
          if (state.totalLikes > 0) state.totalLikes -= 1; // ✅ negative guard
        }
      });
  },
});

export const { removeFromLikedVideos, clearLikedVideos } =
  videoLikeSlice.actions;
export default videoLikeSlice.reducer;

// ── Selectors ──
export const selectLikedVideos = (state) => state.videoLikes.videos;
export const selectVideoLikeStatus = (state) => state.videoLikes.status;
export const selectTotalVideoLikes = (state) => state.videoLikes.totalLikes;

export const selectIsVideoLiked = (videoId) => (state) =>
  state.videoLikes.videos.some(
    (video) => normalizeId(video._id) === normalizeId(videoId) // ✅
  );