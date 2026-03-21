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
        error.response?.data?.message || error.message
      );
    }
  }
);

export const toggleLike = createAsyncThunk(
  "likes/toggleLike",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/posts/${postId}/like`,
        {},
        { withCredentials: true }
      );
      console.log("Toggle Like Response →", res.data); 
      return { postId, liked: res.data?.liked };
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
      // ── fetchMyLikes ──
      .addCase(fetchMyLikes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyLikes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.posts = action.payload.posts;
        state.totalLikes = action.payload.totalLikes;
      })
      .addCase(fetchMyLikes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

    
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, liked } = action.payload;

        if (liked) {
        
          const exists = state.posts.some((p) => p._id === postId);
          if (!exists) {
            state.posts.push({ _id: postId });
            state.totalLikes += 1;
          }
        } else {
         
          state.posts = state.posts.filter((p) => p._id !== postId);
          state.totalLikes -= 1;
        }
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