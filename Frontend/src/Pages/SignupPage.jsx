import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";

const STEPS = ["Basic Info", "Photos", "Password"];

export default function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    avatar: "",
    coverImage: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);

  const avatarRef = useRef(null);
  const coverRef = useRef(null);

  const updateFormData = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "avatar") {
      setAvatarPreview(url);
      updateFormData("avatar", file);
    } else {
      setCoverPreview(url);
      updateFormData("coverImage", file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/register",
        fd,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setSuccess(res.data.message || "Registration successful!");
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

        .auth-bg {
          min-height: 100vh;
          background: radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 50%),
                      linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; padding: 20px;
        }

        .auth-card {
          width: 100%; max-width: 420px;
          background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px; padding: 36px 32px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .auth-logo {
          text-align: center; font-size: 30px; font-weight: 800; font-style: italic;
          background: linear-gradient(135deg, #06b6d4, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          margin-bottom: 20px; letter-spacing: -0.03em;
        }

        /* Step indicator */
        .step-track {
          display: flex; align-items: center; gap: 0;
          margin-bottom: 28px;
        }
        .step-item {
          display: flex; flex-direction: column; align-items: center; flex: 1;
        }
        .step-circle {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800;
          transition: all 0.3s;
        }
        .step-circle.done { background: linear-gradient(135deg,#06b6d4,#6366f1); color:#fff; box-shadow:0 0 12px rgba(6,182,212,0.4); }
        .step-circle.active { background: rgba(6,182,212,0.15); color:#06b6d4; border:2px solid rgba(6,182,212,0.4); }
        .step-circle.idle { background: rgba(255,255,255,0.04); color:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.07); }
        .step-label { font-size:10px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; margin-top:5px; }
        .step-label.done, .step-label.active { color:rgba(255,255,255,0.55); }
        .step-label.idle { color:rgba(255,255,255,0.18); }
        .step-line { flex:1; height:1px; background:rgba(255,255,255,0.07); margin-bottom:14px; }
        .step-line.done { background: linear-gradient(90deg,#06b6d4,#6366f1); }

        /* Inputs */
        .auth-label {
          display:block; font-size:11px; font-weight:700; letter-spacing:0.08em;
          text-transform:uppercase; color:rgba(255,255,255,0.28); margin-bottom:6px;
        }
        .auth-input-wrap { position:relative; margin-bottom:16px; }
        .auth-input {
          width:100%; height:46px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          border-radius:14px; color:rgba(255,255,255,0.88);
          font-family:'Syne',sans-serif; font-size:14px;
          padding:0 44px 0 16px; outline:none; box-sizing:border-box;
          transition:border-color 0.2s, background 0.2s;
        }
        .auth-input:focus { border-color:rgba(6,182,212,0.45); background:rgba(6,182,212,0.05); }
        .auth-input::placeholder { color:rgba(255,255,255,0.18); }
        .auth-input-toggle {
          position:absolute; right:14px; top:50%; transform:translateY(-50%);
          font-size:16px; cursor:pointer; color:rgba(255,255,255,0.25);
          transition:color 0.2s; background:none; border:none; padding:0;
        }
        .auth-input-toggle:hover { color:rgba(255,255,255,0.6); }

        /* Phone override */
        .auth-phone-wrap .react-tel-input .form-control {
          width:100% !important; height:46px !important;
          background:rgba(255,255,255,0.04) !important;
          border:1px solid rgba(255,255,255,0.08) !important;
          border-radius:14px !important; color:rgba(255,255,255,0.88) !important;
          font-family:'Syne',sans-serif !important; font-size:14px !important;
          padding-left:52px !important; box-sizing:border-box !important;
        }
        .auth-phone-wrap .react-tel-input .form-control:focus {
          border-color:rgba(6,182,212,0.45) !important;
          background:rgba(6,182,212,0.05) !important;
          box-shadow:none !important;
        }
        .auth-phone-wrap .react-tel-input .flag-dropdown {
          background:rgba(255,255,255,0.05) !important;
          border:1px solid rgba(255,255,255,0.08) !important;
          border-right:none !important; border-radius:14px 0 0 14px !important;
        }
        .auth-phone-wrap .react-tel-input .selected-flag:hover,
        .auth-phone-wrap .react-tel-input .selected-flag:focus {
          background:rgba(255,255,255,0.08) !important;
        }
        .auth-phone-wrap .react-tel-input .country-list {
          background:#1e293b !important; border:1px solid rgba(255,255,255,0.08) !important;
          border-radius:12px !important; color:rgba(255,255,255,0.8) !important;
          font-family:'Syne',sans-serif !important;
        }
        .auth-phone-wrap .react-tel-input .country-list .country:hover {
          background:rgba(255,255,255,0.06) !important;
        }
        .auth-phone-wrap .react-tel-input .country-list .search-box {
          background:rgba(255,255,255,0.05) !important;
          border:1px solid rgba(255,255,255,0.1) !important;
          color:rgba(255,255,255,0.8) !important; border-radius:8px !important;
        }

        /* Photo upload */
        .photo-upload-cover {
          width:100%; height:120px; border-radius:16px; overflow:hidden;
          border:2px dashed rgba(255,255,255,0.1); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.03);
          transition:border-color 0.2s, background 0.2s;
          position:relative; margin-bottom:20px;
        }
        .photo-upload-cover:hover { border-color:rgba(6,182,212,0.35); background:rgba(6,182,212,0.04); }
        .photo-upload-cover img { width:100%; height:100%; object-fit:cover; border-radius:14px; }
        .photo-upload-cover .upload-placeholder {
          display:flex; flex-direction:column; align-items:center; gap:6px;
          color:rgba(255,255,255,0.22);
        }
        .photo-upload-cover .upload-placeholder span { font-size:28px; }
        .photo-upload-cover .upload-placeholder p { font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; }

        .photo-upload-avatar-row {
          display:flex; justify-content:center; margin-bottom:8px;
        }
        .photo-upload-avatar {
          width:80px; height:80px; border-radius:50%; cursor:pointer;
          border:3px dashed rgba(255,255,255,0.12); overflow:hidden;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.03);
          transition:border-color 0.2s;
          font-size:24px;
        }
        .photo-upload-avatar:hover { border-color:rgba(6,182,212,0.4); }
        .photo-upload-avatar img { width:100%; height:100%; object-fit:cover; }

        .photo-hint { text-align:center; font-size:11px; color:rgba(255,255,255,0.2); margin-bottom:20px; }

        /* Buttons */
        .auth-btn-row { display:flex; gap:10px; margin-top:8px; }
        .auth-btn {
          flex:1; height:48px; border-radius:14px; border:none;
          font-family:'Syne',sans-serif; font-size:14px; font-weight:800;
          letter-spacing:0.04em; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:opacity 0.2s, transform 0.15s;
        }
        .auth-btn.primary {
          background:linear-gradient(135deg,#06b6d4,#6366f1); color:#fff;
          box-shadow:0 4px 20px rgba(6,182,212,0.3);
        }
        .auth-btn.primary:hover { opacity:0.9; transform:translateY(-1px); }
        .auth-btn.primary:disabled { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.3); box-shadow:none; cursor:not-allowed; }
        .auth-btn.secondary {
          background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.5);
          border:1px solid rgba(255,255,255,0.08);
        }
        .auth-btn.secondary:hover { background:rgba(255,255,255,0.09); color:rgba(255,255,255,0.8); }

        .auth-alert { padding:10px 14px; border-radius:12px; font-size:12px; font-weight:600; margin-bottom:18px; text-align:center; }
        .auth-alert.error { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); color:#fca5a5; }
        .auth-alert.success { background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.2); color:#86efac; }

        .auth-footer { text-align:center; margin-top:20px; font-size:13px; color:rgba(255,255,255,0.3); }
        .auth-footer button {
          color:#06b6d4; font-weight:700; font-family:'Syne',sans-serif;
          background:none; border:none; cursor:pointer; font-size:13px; margin-left:4px;
          transition:color 0.2s;
        }
        .auth-footer button:hover { color:#67e8f9; }

        @keyframes spin2 { to { transform:rotate(360deg); } }
        .auth-spinner { width:18px; height:18px; border-radius:50%; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; animation:spin2 0.7s linear infinite; }
      `}</style>

      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo">Pluto</div>

          {/* Step Indicator */}
          <div className="step-track">
            {STEPS.map((label, idx) => {
              const n = idx + 1;
              const state = n < step ? "done" : n === step ? "active" : "idle";
              return (
                <React.Fragment key={n}>
                  <div className="step-item">
                    <div className={`step-circle ${state}`}>
                      {state === "done" ? "✓" : n}
                    </div>
                    <span className={`step-label ${state}`}>{label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`step-line ${n < step ? "done" : ""}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {error && <div className="auth-alert error">{error}</div>}
          {success && <div className="auth-alert success">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* STEP 1 */}
            {step === 1 && (
              <>
                {[
                  {
                    label: "Full Name",
                    name: "fullName",
                    type: "text",
                    placeholder: "Your full name",
                  },
                  {
                    label: "Email",
                    name: "email",
                    type: "email",
                    placeholder: "you@example.com",
                  },
                  {
                    label: "Username",
                    name: "username",
                    type: "text",
                    placeholder: "@username",
                  },
                ].map((f) => (
                  <div className="auth-input-wrap" key={f.name}>
                    <label className="auth-label">{f.label}</label>
                    <input
                      className="auth-input"
                      type={f.type}
                      name={f.name}
                      placeholder={f.placeholder}
                      value={formData[f.name]}
                      onChange={handleChange}
                    />
                  </div>
                ))}

                <div style={{ marginBottom: 16 }}>
                  <label className="auth-label">Phone Number</label>
                  <div className="auth-phone-wrap">
                    <PhoneInput
                      country={"in"}
                      value={formData.phone}
                      onChange={(value) => updateFormData("phone", value)}
                      enableSearch={true}
                    />
                  </div>
                </div>

                <div className="auth-btn-row">
                  <button
                    type="button"
                    className="auth-btn primary"
                    onClick={() => setStep(2)}
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <label className="auth-label">Cover Image</label>
                <div
                  className="photo-upload-cover"
                  onClick={() => coverRef.current.click()}
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="cover" />
                  ) : (
                    <div className="upload-placeholder">
                      <span>🖼️</span>
                      <p>Click to upload cover</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={coverRef}
                  onChange={(e) => handleFileChange(e, "coverImage")}
                  style={{ display: "none" }}
                />

                <label className="auth-label">Profile Picture</label>
                <div className="photo-upload-avatar-row">
                  <div
                    className="photo-upload-avatar"
                    onClick={() => avatarRef.current.click()}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" />
                    ) : (
                      "👤"
                    )}
                  </div>
                </div>
                <div className="photo-hint">
                  Click to upload profile picture
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarRef}
                  onChange={(e) => handleFileChange(e, "avatar")}
                  style={{ display: "none" }}
                />

                <div className="auth-btn-row">
                  <button
                    type="button"
                    className="auth-btn secondary"
                    onClick={() => setStep(1)}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="auth-btn primary"
                    onClick={() => setStep(3)}
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <div className="auth-input-wrap">
                  <label className="auth-label">Password</label>
                  <input
                    className="auth-input"
                    type={showPass ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowPass((p) => !p)}
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>

                <div className="auth-btn-row">
                  <button
                    type="button"
                    className="auth-btn secondary"
                    onClick={() => setStep(2)}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="auth-btn primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="auth-spinner" />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="auth-footer">
            Already have an account?
            <button onClick={() => navigate("/")}>Sign in</button>
          </div>
        </div>
      </div>
    </>
  );
}
