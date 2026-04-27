import API from "../utils/API.js";
// src/slices/postSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


// ✅ Fetch user's own posts
export const fetchMyPosts = createAsyncThunk(
  "posts/fetchMyPosts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/posts/my-posts", {
        withCredentials: true,
      });
      return res.data?.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {
    // 🧹 Reset when logout
    resetMyPosts: (state) => {
      state.posts = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload || [];
      })
      .addCase(fetchMyPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { resetMyPosts } = postSlice.actions;
export default postSlice.reducer;
