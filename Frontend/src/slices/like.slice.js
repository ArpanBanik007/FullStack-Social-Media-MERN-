import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ── Helper ──────────────────────────────────────────────────────────
const normalize = (id) => String(id ?? "");

// ── Fetch My Liked Posts ─────────────────────────────────────────────
export const fetchMyLikes = createAsyncThunk(
  "likes/fetchMyLikes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/likes/my-liked-posts", {
        withCredentials: true,
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ── Toggle Like ──────────────────────────────────────────────────────
export const toggleLike = createAsyncThunk(
  "likes/toggleLike",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/posts/${postId}/like`,
        {},
        { withCredentials: true }
      );

      // ✅ Backend response structure handle করো
      const liked =
        res.data?.liked ??
        res.data?.data?.liked ??
        false;

      return { postId: normalize(postId), liked };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const likedPostSlice = createSlice({
  name: "likedPosts",
  initialState: {
    posts: [],
    totalLikes: 0,
    status: "idle",
    error: null,
  },
  reducers: {
    removeFromLiked: (state, action) => {
      const id = normalize(action.payload);
      state.posts = state.posts.filter((p) => normalize(p._id) !== id);
      if (state.totalLikes > 0) state.totalLikes -= 1;
    },
    clearLikedPosts: (state) => {
      state.posts = [];
      state.totalLikes = 0;
      state.status = "idle";
      state.error = null;
    },
    // ✅ Backend থেকে আসা isLiked দিয়ে initial sync করার জন্য
    syncPostLike: (state, action) => {
      const { postId, isLiked } = action.payload;
      const id = normalize(postId);
      const exists = state.posts.some((p) => normalize(p._id) === id);

      if (isLiked && !exists) {
        state.posts.push({ _id: id });
        state.totalLikes += 1;
      } else if (!isLiked && exists) {
        state.posts = state.posts.filter((p) => normalize(p._id) !== id);
        if (state.totalLikes > 0) state.totalLikes -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyLikes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyLikes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.posts = (action.payload?.posts ?? []).map((p) => ({
          ...p,
          _id: normalize(p._id),
        }));
        state.totalLikes = action.payload?.totalLikes ?? 0;
      })
      .addCase(fetchMyLikes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, liked } = action.payload;
        const exists = state.posts.some((p) => normalize(p._id) === postId);

        if (liked && !exists) {
          state.posts.push({ _id: postId });
          state.totalLikes += 1;
        } else if (!liked && exists) {
          state.posts = state.posts.filter((p) => normalize(p._id) !== postId);
          if (state.totalLikes > 0) state.totalLikes -= 1;
        }
      });
  },
});

export const { removeFromLiked, clearLikedPosts, syncPostLike } =
  likedPostSlice.actions;
export default likedPostSlice.reducer;

// ── Selectors ────────────────────────────────────────────────────────
export const selectLikedPosts = (state) => state.likedPosts.posts;
export const selectLikedStatus = (state) => state.likedPosts.status;
export const selectTotalLikes = (state) => state.likedPosts.totalLikes;

// ✅ normalize দিয়ে compare — string mismatch হবে না
export const selectIsPostLiked = (postId) => (state) =>
  state.likedPosts.posts.some(
    (post) => normalize(post._id) === normalize(postId)
  );