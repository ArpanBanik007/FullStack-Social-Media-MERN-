import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Navbar from "../home/Navbar";
import {
  fetchMydetils,
  selectCurrentUser,
  selectMyDetailsLoading,
} from "../slices/mydetails.slice";

function ProfileSetting() {
  const dispatch = useDispatch();
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

  useEffect(() => {
    if (!user) dispatch(fetchMydetils());
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [user?._id]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3500);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return showMessage("error", "Avatar must be under 5MB");
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      setAvatarLoading(true);
      await axios.patch("http://localhost:8000/api/v1/users/avatar", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(fetchMydetils());
      showMessage("success", "Avatar updated!");
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

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024)
      return showMessage("error", "Cover must be under 10MB");
    const formData = new FormData();
    formData.append("coverImage", file);
    try {
      setCoverLoading(true);
      await axios.patch(
        "http://localhost:8000/api/v1/users/cover-Image",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      dispatch(fetchMydetils());
      showMessage("success", "Cover image updated!");
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

  const handleAccountUpdate = async () => {
    const payload = {};

    // শুধু changed fields পাঠাও
    if (fullName.trim() && fullName.trim() !== user?.fullName) {
      payload.fullName = fullName.trim();
    }
    if (email.trim() && email.trim() !== user?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return showMessage("error", "Please enter a valid email");
      }
      payload.email = email.trim();
    }

    if (Object.keys(payload).length === 0) {
      return showMessage("error", "No changes detected");
    }

    try {
      setLoading(true);
      await axios.patch(
        "http://localhost:8000/api/v1/users/update-account",
        payload,
        { withCredentials: true },
      );
      dispatch(fetchMydetils());
      showMessage("success", "Profile updated successfully!");
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching || !user) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
          @keyframes shimPS { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
          @keyframes spin { to{transform:rotate(360deg)} }
          .skPS { background:linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%); background-size:400px 100%; animation:shimPS 1.3s infinite linear; border-radius:12px; }
        `}</style>
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(160deg,#0f172a,#1e293b)",
            fontFamily: "'Syne',sans-serif",
          }}
        >
          <Navbar />
          <div
            style={{ maxWidth: 520, margin: "20px auto", padding: "0 14px" }}
          >
            <div
              className="skPS"
              style={{
                width: "100%",
                height: 176,
                borderRadius: 18,
                marginBottom: 14,
              }}
            />
            <div
              style={{
                background: "linear-gradient(160deg,#1e293b,#0f172a)",
                borderRadius: 18,
                padding: 20,
                border: "1px solid rgba(255,255,255,0.06)",
                marginBottom: 14,
                display: "flex",
                gap: 14,
                alignItems: "center",
              }}
            >
              <div
                className="skPS"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  className="skPS"
                  style={{ height: 13, width: "50%", marginBottom: 10 }}
                />
                <div className="skPS" style={{ height: 10, width: "30%" }} />
              </div>
            </div>
            <div
              style={{
                background: "linear-gradient(160deg,#1e293b,#0f172a)",
                borderRadius: 18,
                padding: 20,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="skPS"
                style={{ height: 13, width: "40%", marginBottom: 20 }}
              />
              <div
                className="skPS"
                style={{ height: 46, width: "100%", marginBottom: 14 }}
              />
              <div className="skPS" style={{ height: 46, width: "100%" }} />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

        .ps-root {
          min-height: 100vh;
          background: radial-gradient(ellipse at 20% 30%, rgba(6,182,212,0.06) 0%, transparent 55%),
                      linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
          font-family: 'Syne', sans-serif;
        }
        .ps-body { max-width:520px; margin:0 auto; padding:20px 14px 60px; display:flex; flex-direction:column; gap:14px; }

        .ps-cover { position:relative; width:100%; height:176px; border-radius:20px; overflow:hidden; border:1px solid rgba(255,255,255,0.06); background:#1e293b; }
        .ps-cover img { width:100%; height:100%; object-fit:cover; display:block; }
        .ps-cover-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%); }
        .ps-cover-btn { position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,0.55); backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,0.15); color:rgba(255,255,255,0.85); font-family:'Syne',sans-serif; font-size:11px; font-weight:700; letter-spacing:0.05em; padding:6px 14px; border-radius:10px; cursor:pointer; transition:background 0.2s; }
        .ps-cover-btn:hover { background:rgba(0,0,0,0.75); color:#fff; }
        .ps-cover-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .ps-cover-loading { position:absolute; inset:0; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; }

        .ps-avatar-card { background:linear-gradient(160deg,#1e293b,#0f172a); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:18px 20px; display:flex; align-items:center; gap:16px; box-shadow:0 4px 20px rgba(0,0,0,0.3); }
        .ps-avatar-wrap { position:relative; flex-shrink:0; }
        .ps-avatar { width:64px; height:64px; border-radius:50%; object-fit:cover; border:3px solid rgba(6,182,212,0.45); box-shadow:0 0 0 3px rgba(6,182,212,0.1); display:block; }
        .ps-avatar-edit { position:absolute; bottom:0; right:0; width:22px; height:22px; border-radius:50%; background:linear-gradient(135deg,#06b6d4,#6366f1); border:2px solid #0f172a; display:flex; align-items:center; justify-content:center; font-size:12px; color:#fff; cursor:pointer; font-weight:800; transition:transform 0.15s; }
        .ps-avatar-edit:hover { transform:scale(1.15); }
        .ps-avatar-loading { position:absolute; inset:0; border-radius:50%; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; }
        .ps-user-name { font-size:17px; font-weight:800; color:rgba(255,255,255,0.9); }
        .ps-user-handle { font-size:12px; color:rgba(255,255,255,0.35); margin-top:3px; }

        .ps-edit-card { background:linear-gradient(160deg,#1e293b,#0f172a); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:22px 20px; box-shadow:0 4px 20px rgba(0,0,0,0.3); }
        .ps-edit-title { font-size:16px; font-weight:800; color:rgba(255,255,255,0.9); margin-bottom:20px; }

        .ps-input-wrap { margin-bottom:16px; }
        .ps-label { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.28); margin-bottom:7px; }
        .ps-changed-dot { width:6px; height:6px; border-radius:50%; background:#06b6d4; box-shadow:0 0 5px rgba(6,182,212,0.6); flex-shrink:0; }
        .ps-input { width:100%; height:48px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:14px; color:rgba(255,255,255,0.88); font-family:'Syne',sans-serif; font-size:14px; padding:0 16px; outline:none; box-sizing:border-box; transition:border-color 0.2s, background 0.2s; }
        .ps-input:focus { border-color:rgba(6,182,212,0.45); background:rgba(6,182,212,0.05); }
        .ps-input::placeholder { color:rgba(255,255,255,0.18); }

        .ps-alert { padding:10px 14px; border-radius:12px; font-size:12px; font-weight:600; margin-bottom:18px; animation:fadeIn 0.2s ease; }
        .ps-alert.success { background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.2); color:#86efac; }
        .ps-alert.error { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); color:#fca5a5; }

        .ps-save-btn { width:100%; height:50px; border-radius:14px; margin-top:6px; background:linear-gradient(135deg,#06b6d4,#6366f1); border:none; color:#fff; font-family:'Syne',sans-serif; font-size:15px; font-weight:800; letter-spacing:0.04em; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 20px rgba(6,182,212,0.3); transition:opacity 0.2s, transform 0.15s; }
        .ps-save-btn:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); }
        .ps-save-btn:disabled { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.3); box-shadow:none; cursor:not-allowed; }

        .ps-spinner { width:18px; height:18px; border-radius:50%; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; animation:spin 0.7s linear infinite; }
        .ps-small-spinner { width:14px; height:14px; border-radius:50%; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; animation:spin 0.7s linear infinite; }
      `}</style>

      <div className="ps-root">
        <Navbar />
        <div className="ps-body">
          {/* Cover */}
          <div className="ps-cover">
            <img
              src={
                user?.coverImage ||
                "https://plus.unsplash.com/premium_photo-1673177667569-e3321a8d8256?fm=jpg&q=60&w=3000"
              }
              alt="cover"
            />
            <div className="ps-cover-overlay" />
            {coverLoading && (
              <div className="ps-cover-loading">
                <div className="ps-spinner" />
              </div>
            )}
            <button
              className="ps-cover-btn"
              onClick={() => coverRef.current?.click()}
              disabled={coverLoading}
            >
              {coverLoading ? "Uploading..." : "Change Cover"}
            </button>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleCoverChange}
            />
          </div>

          {/* Avatar + user info */}
          <div className="ps-avatar-card">
            <div className="ps-avatar-wrap">
              <img
                src={
                  user?.avatar ||
                  "https://www.svgrepo.com/show/452030/avatar-default.svg"
                }
                alt="avatar"
                className="ps-avatar"
              />
              {avatarLoading ? (
                <div className="ps-avatar-loading">
                  <div className="ps-small-spinner" />
                </div>
              ) : (
                <div
                  className="ps-avatar-edit"
                  onClick={() => avatarRef.current?.click()}
                >
                  +
                </div>
              )}
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <div className="ps-user-name">{user?.fullName}</div>
              <div className="ps-user-handle">@{user?.username}</div>
            </div>
          </div>

          {/* Edit form — দুটো field সবসময় দেখাবে */}
          <div className="ps-edit-card">
            <div className="ps-edit-title">Edit Profile</div>

            {message.text && (
              <div className={`ps-alert ${message.type}`}>{message.text}</div>
            )}

            {/* Full Name */}
            <div className="ps-input-wrap">
              <label className="ps-label">
                Full Name
                {fullName.trim() !== (user?.fullName || "") && (
                  <span className="ps-changed-dot" />
                )}
              </label>
              <input
                className="ps-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAccountUpdate();
                }}
              />
            </div>

            {/* Email */}
            <div className="ps-input-wrap">
              <label className="ps-label">
                Email
                {email.trim() !== (user?.email || "") && (
                  <span className="ps-changed-dot" />
                )}
              </label>
              <input
                className="ps-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAccountUpdate();
                }}
              />
            </div>

            <button
              className="ps-save-btn"
              onClick={handleAccountUpdate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="ps-spinner" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileSetting;
