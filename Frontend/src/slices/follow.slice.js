import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// fetch all followings once
export const fetchMyFollowings = createAsyncThunk(
  "follow/fetchMyFollowings",
  async (_, { rejectWithValue }) => {
    try {

      const res = await axios.get(
        "http://localhost:8000/api/v1/users/interactions/myfollowing",
        { withCredentials: true }
      );

      console.log("FOLLOW API RESPONSE:", res.data);

      return res.data?.data?.following.map(
        (item) => item.following._id
      ) || [];

    } catch (err) {

      return rejectWithValue(
        err.response?.data?.message || err.message
      );

    }
  }
);

const followSlice = createSlice({
  name: "follow",
  initialState: {
    followings: [],
    loading: false,
    error: null,
  },
  reducers: {
    addFollowing: (state, action) => {
      if (!state.followings.includes(action.payload)) state.followings.push(action.payload);
    },
    removeFollowing: (state, action) => {
      state.followings = state.followings.filter(id => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyFollowings.pending, (state) => { state.loading = true; })
      .addCase(fetchMyFollowings.fulfilled, (state, action) => {
        state.loading = false;
        state.followings = action.payload;
       console.log("Redux updated followings:", action.payload);
      })
      .addCase(fetchMyFollowings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


export const { addFollowing, removeFollowing } = followSlice.actions;
export default followSlice.reducer;