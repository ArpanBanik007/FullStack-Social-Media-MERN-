import API from "../utils/API.js";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const normalizeId = (id) => String(id ?? "");

// ── Fetch My Liked Videos ──
export const fetchMyVideoLikes = createAsyncThunk(
  "videoLikes/fetchMyVideoLikes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/videos/mylikedvideos", {
        withCredentials: true,
      });
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
      const res = await API.post(
        `/videos/like/${videoId}`,
        {},
        { withCredentials: true }
      );
      const liked = res.data?.data?.liked ?? res.data?.liked;
      return { videoId: normalizeId(videoId), liked };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

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
      if (state.totalLikes > 0) state.totalLikes -= 1;
    },
    clearLikedVideos: (state) => {
      state.videos = [];
      state.totalLikes = 0;
      state.status = "idle";
      state.error = null;
    },
    // ✅ Post এর syncPostLike এর মতো same pattern
    syncVideoLike: (state, action) => {
      const { videoId, isLiked } = action.payload;
      const id = normalizeId(videoId);
      const exists = state.videos.some((v) => normalizeId(v._id) === id);

      if (isLiked && !exists) {
        state.videos.push({ _id: id });
        state.totalLikes += 1;
      } else if (!isLiked && exists) {
        state.videos = state.videos.filter((v) => normalizeId(v._id) !== id);
        if (state.totalLikes > 0) state.totalLikes -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyVideoLikes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyVideoLikes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.videos = (action.payload?.videos ?? []).map((v) => ({
          ...v,
          _id: normalizeId(v._id),
        }));
        state.totalLikes = action.payload?.totalLikes ?? 0;
      })
      .addCase(fetchMyVideoLikes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // ✅ toggleVideoLike fulfilled এ Redux sync — Post এর মতো
      .addCase(toggleVideoLike.fulfilled, (state, action) => {
        const { videoId, liked } = action.payload;
        const exists = state.videos.some((v) => normalizeId(v._id) === videoId);

        if (liked && !exists) {
          state.videos.push({ _id: videoId });
          state.totalLikes += 1;
        } else if (!liked && exists) {
          state.videos = state.videos.filter(
            (v) => normalizeId(v._id) !== videoId
          );
          if (state.totalLikes > 0) state.totalLikes -= 1;
        }
      });
  },
});

export const { removeFromLikedVideos, clearLikedVideos, syncVideoLike } =
  videoLikeSlice.actions;
export default videoLikeSlice.reducer;

// ── Selectors ──
export const selectLikedVideos = (state) => state.videoLikes.videos;
export const selectVideoLikeStatus = (state) => state.videoLikes.status;
export const selectTotalVideoLikes = (state) => state.videoLikes.totalLikes;

// ✅ Post এর selectIsPostLiked এর মতো same pattern
export const selectIsVideoLiked = (videoId) => (state) =>
  state.videoLikes.videos.some(
    (v) => normalizeId(v._id) === normalizeId(videoId)
  );