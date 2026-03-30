import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetMyDetails, selectCurrentUser } from "../slices/mydetails.slice";
import { persistor } from "../store/store";
import Navbar from "../home/Navbar";

function SecuritySetting() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text: "" }

  // ===================== CHANGE PASSWORD =====================
  const handleChangePassword = async () => {
    if (!oldPassword.trim() || !newPassword.trim()) {
      setMessage({ type: "error", text: "দুটো field পূরণ করো" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password কমপক্ষে 6 character হতে হবে",
      });
      return;
    }

    try {
      setPasswordLoading(true);
      setMessage(null);

      await axios.post(
        "http://localhost:8000/api/v1/users/change-password",
        { oldPassword, newPassword },
        { withCredentials: true },
      );

      setMessage({
        type: "success",
        text: "Password সফলভাবে বদলানো হয়েছে ✅",
      });
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Password বদলাতে ব্যর্থ হয়েছে ❌",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // ===================== LOGOUT =====================
  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      await axios.post(
        "http://localhost:8000/api/v1/users/logout",
        {},
        { withCredentials: true },
      );

      // ✅ Redux clear
      dispatch(resetMyDetails());

      // ✅ Persist clear
      await persistor.purge();
      localStorage.clear();
      sessionStorage.clear();

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* ===== Profile Card ===== */}
        <div className="bg-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <img
            src={currentUser?.avatar || "https://via.placeholder.com/64"}
            alt="avatar"
            className="h-16 w-16 rounded-full object-cover border-2 border-blue-500"
          />
          <div>
            <h4 className="text-lg font-bold text-white">
              {currentUser?.fullName || "User"}
            </h4>
            <p className="text-sm text-gray-400">
              @{currentUser?.username || "username"}
            </p>
          </div>
        </div>

        {/* ===== Message ===== */}
        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-green-800 text-green-200"
                : "bg-red-800 text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ===== Password Card ===== */}
        <div className="bg-gray-800 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-white font-semibold text-lg">Change Password</h2>

          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Old Password</label>
            <input
              type="password"
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="bg-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={passwordLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors text-white font-semibold py-2.5 rounded-xl cursor-pointer"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </div>

        {/* ===== Logout Card ===== */}
        <div className="bg-gray-800 rounded-2xl p-5">
          <p className="text-gray-400 text-sm mb-3">
            Logging out will end your current session.
          </p>
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors text-white font-semibold py-2.5 rounded-xl cursor-pointer"
          >
            {logoutLoading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecuritySetting;
