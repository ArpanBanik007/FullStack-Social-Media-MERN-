import { Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./Pages/SignupPage";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import OwnProfilepage from "./Pages/OwnProfilepage";
import SavePage from "./Pages/SavePage";
import HistoryPage from "./Pages/HistoryPage";
import SettingPage from "./Pages/SettingPage";
import ProfileSettting from "./settings/ProfileSettting";
import SecuritySetting from "./settings/SecuritySetting";
import UserProfileTotalPage from "./Pages/UserProfileTotalPage";
import VideoPlayer from "./VideoFeed/VideoPlayer";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchMyLikes } from "./slices/like.slice";
import {
  selectCurrentUser,
  setCredentials,
  clearCredentials,
} from "./slices/mydetails.slice";
import { connectSocket, disconnectSocket } from "./socket";
import CommentPage from "./Pages/CommentPage";
import { fetchMyVideoLikes } from "./slices/video.like.slice";
import VideoCommentPage from "./Pages/VideoCommentPage";
import CommentCountpage from "./Pages/CommentCountpage";
import LikeCountpage from "./Pages/LikeCountpage";
import SinglePostViewPage from "./Pages/SinglePostViewPage";
import SingleVideoViewPage from "./Pages/SinglevideoViewpage";
import ChatMainPage from "./Chat/chatmainpage";
import { setOnlineUsers } from "./slices/chat.slice";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api/v1`
  : "/api/v1";

// ✅ Professional Full Screen Loading Animation
const AppLoader = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>

          <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
        </div>

        {/* Text */}
        <p className="text-sm text-gray-600 font-medium tracking-wide">
          Loading...
        </p>
      </div>
    </div>
  );
};

// ✅ Login থাকলে /home এ পাঠাবে
const AutoRedirect = ({ isChecking }) => {
  const currentUser = useSelector(selectCurrentUser);

  if (isChecking) return <AppLoader />;

  if (currentUser?._id) {
    return <Navigate to="/home" replace />;
  }

  return <LoginPage />;
};

// ✅ Login না থাকলে / এ পাঠাবে
const ProtectedRoute = ({ children, isChecking }) => {
  const currentUser = useSelector(selectCurrentUser);

  if (isChecking) return <AppLoader />;

  if (!currentUser?._id) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const res = await axios.post(
          `${BASE_URL}/users/refresh-token`,
          {},
          {
            withCredentials: true,
          },
        );

        const { user, accessToken } = res.data.data;

        dispatch(setCredentials({ user, accessToken }));
      } catch (error) {
        dispatch(clearCredentials());
      } finally {
        setIsChecking(false);
      }
    };

    autoLogin();
  }, [dispatch]);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchMyLikes());
      dispatch(fetchMyVideoLikes());

      const socket = connectSocket(currentUser._id);

      socket.on("online-users", (users) => {
        dispatch(setOnlineUsers(users));
      });

      return () => {
        socket.off("online-users");
      };
    } else {
      disconnectSocket();
    }
  }, [currentUser, dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<AutoRedirect isChecking={isChecking} />} />

      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <OwnProfilepage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/videos"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <VideoPlayer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/videos/:videoId"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <VideoPlayer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/saved"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <SavePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <ChatMainPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:conversationId"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <ChatMainPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <HistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <SettingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/profile"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <ProfileSettting />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/security"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <SecuritySetting />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <UserProfileTotalPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/post/single/:postId"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <SinglePostViewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/post/:postId"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <CommentPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/video/single/:videoId"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <SingleVideoViewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/video/comments/:videoId"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <VideoCommentPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mycomments"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <CommentCountpage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/myallLikes"
        element={
          <ProtectedRoute isChecking={isChecking}>
            <LikeCountpage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
