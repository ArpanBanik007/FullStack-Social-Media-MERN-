import API from "../utils/API.js";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


export const getPostViews = createAsyncThunk(
  "postView/getPostViews",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await API.get(
        `/views/post/${postId}`,
        { withCredentials: true } // ✅
      );
      return res.data.data.views;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch views");
    }
  }
);

export const addPostView = createAsyncThunk(
  "postView/addPostView",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await API.post(
        `/views/post/${postId}`,
        {}, // ✅ body empty
        { withCredentials: true } // ✅
      );
      return res.data.data.alreadyViewed;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add view");
    }
  }
);

const postViewSlice = createSlice({
  name: "postView",
  initialState: {
    views: 0,
    loading: false,
    error: null,
  },
  reducers: {
    updatePostViews: (state, action) => {
      state.views = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPostViews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPostViews.fulfilled, (state, action) => {
        state.loading = false;
        state.views = action.payload;
      })
      .addCase(getPostViews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addPostView.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPostView.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addPostView.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updatePostViews } = postViewSlice.actions;
export default postViewSlice.reducer;