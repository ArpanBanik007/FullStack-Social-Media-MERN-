import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMyLikes= createAsyncThunk(
    "likes/fetchMyLikes",
    async (_,{rejectWithValue}) => {
         try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/likes/my-liked-posts",
        { withCredentials: true }
      );
      return res.data.data; 
    }  catch (error) {
          return rejectWithValue(
        err.response?.data?.message || err.message
      );   
        }
    }
);

const likedPostSlice= createSlice({
  name:"likedPosts",
  initialState:{
    posts:[],
    totalLikes: 0,
    status: "idle",   
    error: null,
  }
})