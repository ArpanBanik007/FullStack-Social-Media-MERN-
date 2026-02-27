// // src/redux/store.js
// import { configureStore } from "@reduxjs/toolkit";
// import storage from "redux-persist/lib/storage";
// import { persistReducer, persistStore } from "redux-persist";

// import postReducer from "../slices/postSlice";
// import myDetailsReducer from "../slices/mydetails.slice";

// // ✅ ONLY persist user related data
// const persistDetailsConfig = {
//   key: "mydetails",
//   storage,
// };

// // ✅ Persist only mydetails
// const persistedMyDetailsReducer = persistReducer(
//   persistDetailsConfig,
//   myDetailsReducer
// );

// export const store = configureStore({
//   reducer: {
//     posts: postReducer,               // ❌ NOT persisted
//     mydetails: persistedMyDetailsReducer, // ✅ persisted
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({ serializableCheck: false }),
// });

// export const persistor = persistStore(store);



// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

import postReducer from "../slices/postSlice";
import myDetailsReducer from "../slices/mydetails.slice";
import followReducer from "../slices/follow.slice"; // ✅ import follow slice

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
    follow: followReducer, // ✅ register follow slice here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
