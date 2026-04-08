
// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

import postReducer from "../slices/postSlice";
import myDetailsReducer from "../slices/mydetails.slice";
import followReducer from "../slices/follow.slice"; 
import likedPostSlice from "../slices/like.slice"
import videoLikeReducer from "../slices/video.like.slice"
import postViewSlice from "../slices/postView.slice"
import watchHistoryReducer from "../slices/watchHistory.slice"

// persist config (only for user details)
const persistDetailsConfig = {
  key: "mydetails",
  storage,
};

const persistedMyDetailsReducer = persistReducer(
  persistDetailsConfig,
  myDetailsReducer
);

export const store = configureStore({
  reducer: {
    posts: postReducer,
    mydetails: persistedMyDetailsReducer,
    follow: followReducer,
    likedPosts: likedPostSlice,
    videoLikes: videoLikeReducer,    
    postView: postViewSlice,
    watchHistory: watchHistoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});





export const persistor = persistStore(store);
