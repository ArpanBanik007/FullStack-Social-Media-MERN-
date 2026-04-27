import API from "../utils/API.js";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";



export const fetchSearchResults= createAsyncThunk(
      "search/fetchSearchResults",
  async (query, { rejectWithValue }) => {
    try {
      const response = await API.get(
        `/search?q=${encodeURIComponent(query)}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Search failed"
      );
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────
const searchSlice = createSlice({
  name: "search",
  initialState: {
    query: "",
    results: {
      users: [],
      posts: [],
      videos: [],
    },
    status: "idle", 
    isOpen: false,
    error: null,
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    closeSearch: (state) => {
      state.isOpen = false;
      state.query = "";
      state.results = { users: [], posts: [], videos: [] };
      state.status = "idle";
    },
    clearResults: (state) => {
      state.results = { users: [], posts: [], videos: [] };
      state.status = "idle";
      state.isOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.status = "loading";
        state.isOpen = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isOpen = true;
        state.results = action.payload.data;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});
 
export const { setQuery, closeSearch, clearResults } = searchSlice.actions;
 
// ── Selectors ────────────────────────────────────────────────────────────────
export const selectSearchQuery   = (state) => state.search.query;
export const selectSearchResults = (state) => state.search.results;
export const selectSearchStatus  = (state) => state.search.status;
export const selectSearchIsOpen  = (state) => state.search.isOpen;
 
export default searchSlice.reducer;
 