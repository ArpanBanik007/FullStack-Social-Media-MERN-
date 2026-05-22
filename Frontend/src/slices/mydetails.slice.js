import API from "../utils/API.js";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchMydetils = createAsyncThunk(
  "user/fetchMyDetails",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/users/current-user", {
        withCredentials: true,
      });
      return res.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const myDetailsSlice = createSlice({
  name: "mydetails",
  initialState: {
    mydetails: {},
    accessToken: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetMyDetails: (state) => {
      state.mydetails = {};
      state.accessToken = null;
      state.loading = false;
      state.error = null;
    },

    setCredentials: (state, action) => {
      state.mydetails = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.loading = false;
    },
    clearCredentials: (state) => {
      state.mydetails = {};
      state.accessToken = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMydetils.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMydetils.fulfilled, (state, action) => {
        state.loading = false;
        state.mydetails = action.payload || {};
      })
      .addCase(fetchMydetils.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { resetMyDetails, setCredentials, clearCredentials } = myDetailsSlice.actions;
export const selectCurrentUser = (state) => state.mydetails.mydetails;
export const selectAccessToken = (state) => state.mydetails.accessToken;
export const selectMyDetailsLoading = (state) => state.mydetails.loading;
export default myDetailsSlice.reducer;