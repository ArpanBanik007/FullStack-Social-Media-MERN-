            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div className="auth-input-wrap">
                  <label className="auth-label">Email</label>
                  <input
                    className="auth-input"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="auth-btn-row">
                  <button
                    type="button"
                    className="auth-btn primary"
                    onClick={handleSendOTP}
                    disabled={!formData.email || sendingOTP}
                  >
                    {sendingOTP ? (
                      <span className="auth-spinner" style={{ width: "14px", height: "14px" }} />
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div className="auth-input-wrap">
                  <label className="auth-label">Enter OTP sent to {formData.email}</label>
                  <input
                    className="auth-input"
                    type="text"
                    name="otp"
                    placeholder="6-digit OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength={6}
                    style={{ letterSpacing: "4px", textAlign: "center", fontSize: "18px" }}
                  />
                </div>
                <div className="auth-btn-row">
                  <button
                    type="button"
                    className="auth-btn secondary"
                    onClick={() => {
                      setStep(1);
                      setOtpSent(false);
                      setOtpVerified(false);
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="auth-btn secondary"
                    onClick={handleSendOTP}
                    disabled={otpCooldown > 0 || sendingOTP}
                  >
                    {sendingOTP ? "Sending..." : otpCooldown > 0 ? `Resend ${otpCooldown}s` : "Resend OTP"}
                  </button>
                </div>
                <div className="auth-btn-row" style={{ marginTop: "10px" }}>
                  <button
                    type="button"
                    className="auth-btn primary"
                    onClick={handleVerifyOTP}
                    disabled={formData.otp.length !== 6 || verifyingOTP}
                  >
                    {verifyingOTP ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <div className="auth-input-wrap">
                  <label className="auth-label">Email (Verified)</label>
                  <input
                    className="auth-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                    style={{ opacity: 0.6 }}
                  />
                </div>

                <div className="auth-input-wrap">
                  <label className="auth-label">Full Name</label>
                  <input
                    className="auth-input"
                    type="text"
                    name="fullName"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-input-wrap">
                  <label className="auth-label">Username</label>
                  <input
                    className="auth-input"
                    type="text"
                    name="username"
                    placeholder="@username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

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
