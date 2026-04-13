import { Routes, Route } from "react-router-dom";
import SignUp from "./Pages/SignupPage";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import Videopage from "./Pages/Videopage";
import OwnProfilepage from "./Pages/OwnProfilepage";
import SavePage from "./Pages/SavePage";
import HistoryPage from "./Pages/HistoryPage";
import SettingPage from "./Pages/SettingPage";
import ProfileSettting from "./settings/ProfileSettting";
import SecuritySetting from "./settings/SecuritySetting";
import UserProfileTotalPage from "./Pages/UserProfileTotalPage";
import VideoPlayer from "./VideoFeed/VideoPlayer";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchMyLikes } from "./slices/like.slice";
import { fetchMydetils, selectCurrentUser } from "./slices/mydetails.slice";
import CommentPage from "./Pages/CommentPage";
import { fetchMyVideoLikes } from "./slices/video.like.slice";
import VideoCommentPage from "./Pages/VideoCommentPage";
import CommentCountpage from "./Pages/CommentCountpage";
import LikeCountpage from "./Pages/LikeCountpage";
import SinglePostViewPage from "./Pages/SinglePostViewPage";
import SingleVideoViewPage from "./Pages/SinglevideoViewpage";
// ✅ PascalCase দিয়ে import করো — lowercase হলে React HTML tag মনে করে, render হয় না
import ChatMainPage from "./Chat/chatmainpage";

function App() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    dispatch(fetchMydetils());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchMyLikes());
      dispatch(fetchMyVideoLikes());
    }
  }, [currentUser]);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={<OwnProfilepage />} />
      <Route path="/videos" element={<VideoPlayer />} />
      <Route path="/videos/:videoId" element={<VideoPlayer />} />
      <Route path="/saved" element={<SavePage />} />
      {/* ✅ ChatMainPage — PascalCase */}
      <Route path="/chats" element={<ChatMainPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/settings" element={<SettingPage />} />
      <Route path="/settings/profile" element={<ProfileSettting />} />
      <Route path="/settings/security" element={<SecuritySetting />} />
      <Route path="/profile/:userId" element={<UserProfileTotalPage />} />

      {/* ✅ Post routes — specific আগে, dynamic পরে */}
      <Route path="/post/single/:postId" element={<SinglePostViewPage />} />
      <Route path="/post/:postId" element={<CommentPage />} />

      {/* ✅ Video routes */}
      <Route path="/video/single/:videoId" element={<SingleVideoViewPage />} />
      <Route path="/video/comments/:videoId" element={<VideoCommentPage />} />

      {/* ✅ Other pages */}
      <Route path="/mycomments" element={<CommentCountpage />} />
      <Route path="/myallLikes" element={<LikeCountpage />} />
    </Routes>
  );
}

export default App;
