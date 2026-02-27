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
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchMydetils } from "./slices/mydetails.slice";
import CommentPage from "./Pages/CommentPage";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMydetils());
  }, [dispatch]);

  return (
    <Routes>
      {/* login and signup */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignUp />} />
      {/* other pages */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/videos" element={<Videopage />} />
      <Route path="/profile" element={<OwnProfilepage />} />
      <Route path="/saved" element={<SavePage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/settings" element={<SettingPage />} />
      <Route path="/settings/profile" element={<ProfileSettting />} />
      <Route path="/settings/security" element={<SecuritySetting />} />
      <Route path="/profile/user" element={<UserProfileTotalPage />} />
      <Route path="/post/:postId" element={<CommentPage />} />
    </Routes>
  );
}

export default App;
