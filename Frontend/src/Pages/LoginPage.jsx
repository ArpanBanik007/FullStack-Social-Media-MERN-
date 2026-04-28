import API from "../utils/API.js";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


// Inline styled inputs — no dependency on InputField/Button for auth pages
function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await API.post(
        "/users/login",
        formData,
        { withCredentials: true },
      );
      setSuccess(res?.data?.message || "Login successful!");

      // Store token in localStorage as fallback for Socket.IO
      if (res.data?.data?.accessToken) {
        localStorage.setItem("token", res.data.data.accessToken);
      }

      setTimeout(() => navigate("/home"), 1000);
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
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          padding: 20px;
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
          background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 36px 32px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .auth-logo {
          text-align: center;
          font-size: 32px;
          font-weight: 800;
          font-style: italic;
          background: linear-gradient(135deg, #06b6d4, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 6px;
          letter-spacing: -0.03em;
        }

        .auth-subtitle {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          margin-bottom: 32px;
        }

        .auth-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 7px;
        }

        .auth-input-wrap {
          position: relative;
          margin-bottom: 18px;
        }

        .auth-input {
          width: 100%;
          height: 48px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          color: rgba(255,255,255,0.88);
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          padding: 0 44px 0 16px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, background 0.2s;
        }
        .auth-input:focus { border-color: rgba(6,182,212,0.45); background: rgba(6,182,212,0.05); }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }

        .auth-input-toggle {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 16px; cursor: pointer;
          color: rgba(255,255,255,0.25);
          transition: color 0.2s;
          background: none; border: none; padding: 0;
          user-select: none;
        }
        .auth-input-toggle:hover { color: rgba(255,255,255,0.6); }

        .auth-alert {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 18px;
          text-align: center;
        }
        .auth-alert.error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; }
        .auth-alert.success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #86efac; }

        .auth-submit {
          width: 100%;
          height: 50px;
          border-radius: 14px;
          background: linear-gradient(135deg, #06b6d4, #6366f1);
          border: none;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 20px rgba(6,182,212,0.3);
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .auth-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .auth-submit:disabled { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.3); box-shadow: none; cursor: not-allowed; }

        .auth-footer {
          text-align: center;
          margin-top: 22px;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
        }
        .auth-footer button {
          color: #06b6d4; font-weight: 700; font-family: 'Syne', sans-serif;
          background: none; border: none; cursor: pointer;
          font-size: 13px; margin-left: 4px;
          transition: color 0.2s;
        }
        .auth-footer button:hover { color: #67e8f9; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          animation: spin 0.7s linear infinite;
        }
      `}</style>

      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo">Pluto</div>
          <div className="auth-subtitle">Welcome back</div>

          {error && <div className="auth-alert error">{error}</div>}
          {success && <div className="auth-alert success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-input-wrap">
              <label className="auth-label">Email or Username</label>
              <input
                className="auth-input"
                type="text"
                name="identifier"
                placeholder="you@example.com"
                value={formData.identifier}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            <div className="auth-input-wrap">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-input-toggle"
                onClick={() => setShowPass((p) => !p)}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Log In"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?
            <button onClick={() => navigate("/signup")}>Sign up</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
