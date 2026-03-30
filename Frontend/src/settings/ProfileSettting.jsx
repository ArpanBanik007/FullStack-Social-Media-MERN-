import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Navbar from "../home/Navbar";
import {
  fetchMydetils,
  selectCurrentUser,
  selectMyDetailsLoading,
} from "../slices/mydetails.slice"; // ✅ তোমার actual path অনুযায়ী adjust করো

function ProfileSetting() {
  const dispatch = useDispatch();

  // ✅ সঠিক selector — state.auth নয়
  const user = useSelector(selectCurrentUser);
  const isFetching = useSelector(selectMyDetailsLoading);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const avatarRef = useRef(null);
  const coverRef = useRef(null);

  // ✅ Component mount হলে user fetch করো (যদি আগে না থাকে)
  useEffect(() => {
    if (!user) {
      dispatch(fetchMydetils());
    }
  }, []);

  // ✅ user Redux-এ আসলে input fields populate করো
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // ── Avatar Update ────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return showMessage("error", "Avatar must be under 5MB");
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setAvatarLoading(true);
      const res = await axios.patch(
        "http://localhost:8000/api/v1/users/avatar",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      // ✅ Redux state update

      showMessage("success", "Avatar updated successfully!");
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || "Failed to update avatar",
      );
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  // ── Cover Image Update ───────────────────────────────────────────
  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return showMessage("error", "Cover image must be under 10MB");
    }

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      setCoverLoading(true);
      const res = await axios.patch(
        "http://localhost:8000/api/v1/users/cover-Image",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      showMessage("success", "Cover image updated successfully!");
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || "Failed to update cover",
      );
    } finally {
      setCoverLoading(false);
      e.target.value = "";
    }
  };

  // ── Account Details Update ───────────────────────────────────────
  const handleAccountUpdate = async () => {
    if (!fullName.trim() || !email.trim()) {
      return showMessage("error", "Full name and email cannot be empty");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return showMessage("error", "Please enter a valid email address");
    }

    try {
      setLoading(true);
      const res = await axios.patch(
        "http://localhost:8000/api/v1/users/update-account",
        { fullName: fullName.trim(), email: email.trim() },
        { withCredentials: true },
      );
      dispatch(updateMyDetails(res.data.data));
      showMessage("success", "Profile updated successfully!");
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading Screen (initial fetch) ──────────────────────────────
  if (isFetching || !user) {
    return (
      <div className="bg-gray-950 min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* ── Cover Photo ── */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden h-44 relative">
          <img
            src={
              user?.coverImage ||
              "https://plus.unsplash.com/premium_photo-1673177667569-e3321a8d8256?fm=jpg&q=60&w=3000"
            }
            alt="cover"
            className="w-full h-full object-cover"
          />
          {coverLoading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <button
            onClick={() => coverRef.current?.click()}
            disabled={coverLoading}
            className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-black/80 disabled:opacity-50 transition"
          >
            Change Cover
          </button>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
        </div>

        {/* ── Avatar + Name ── */}
        <div className="bg-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="relative">
            <img
              src={
                user?.avatar ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCn-TbanZWBS1uNFOOkr8QavCC0A9p-4SaFw&s"
              }
              alt="avatar"
              className="h-16 w-16 rounded-full object-cover border-2 border-blue-500"
            />
            {avatarLoading ? (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <button
                onClick={() => avatarRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition"
              >
                +
              </button>
            )}
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">{user?.fullName}</h4>
            <p className="text-sm text-gray-400">@{user?.username}</p>
          </div>
        </div>

        {/* ── Edit Info Card ── */}
        <div className="bg-gray-800 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-white font-semibold text-lg">Edit Profile</h2>

          {message.text && (
            <div
              className={`text-sm px-4 py-2.5 rounded-xl border transition-all ${
                message.type === "success"
                  ? "bg-green-600/20 text-green-400 border-green-600/30"
                  : "bg-red-600/20 text-red-400 border-red-600/30"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              className="bg-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="bg-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleAccountUpdate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 transition-colors text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetting;
