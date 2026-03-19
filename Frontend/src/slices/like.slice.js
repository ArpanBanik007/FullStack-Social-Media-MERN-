import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMyLikes = createAsyncThunk(
  "likes/fetchMyLikes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/likes/my-liked-posts",
        { withCredentials: true }
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message // ✅ Fix 2
      );
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
      state.posts = state.posts.filter(
        (post) => post._id !== action.payload
      );
      state.totalLikes -= 1;
    },
    clearLikedPosts: (state) => {
      state.posts = [];
      state.totalLikes = 0;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyLikes.pending, (state) => { // ✅ Fix 1
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyLikes.fulfilled, (state, action) => { // ✅ Fix 1
        state.status = "succeeded";
        state.posts = action.payload.posts;
        state.totalLikes = action.payload.totalLikes;
      })
      .addCase(fetchMyLikes.rejected, (state, action) => { // ✅ Fix 1
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { removeFromLiked, clearLikedPosts } = likedPostSlice.actions;
export default likedPostSlice.reducer;

export const selectLikedPosts = (state) => state.likedPosts.posts;
export const selectLikedStatus = (state) => state.likedPosts.status;
export const selectTotalLikes = (state) => state.likedPosts.totalLikes;

export const selectIsPostLiked = (postId) => (state) =>
  state.likedPosts.posts.some((post) => post._id === postId);