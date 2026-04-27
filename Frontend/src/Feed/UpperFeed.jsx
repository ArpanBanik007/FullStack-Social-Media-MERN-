import API from "../utils/API.js";
import { IoMdPhotos } from "react-icons/io";
import { RiVideoUploadFill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchMydetils } from "../slices/mydetails.slice";
import { MdOutlineEmojiEmotions } from "react-icons/md";

function UpperFeedpage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mydetails } = useSelector((state) => state.mydetails);

  const [showPostBox, setShowPostBox] = useState(false);
  const [postType, setPostType] = useState("text");
  const [loading, setLoading] = useState(false);

  const [postDescription, setPostDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoDescription, setVideoDescription] = useState("");
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    if (!mydetails || Object.keys(mydetails).length === 0)
      dispatch(fetchMydetils());
  }, [dispatch, mydetails]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video");
      return;
    }
    setSelectedVideo(file);
    setPreviewVideo(URL.createObjectURL(file));
  };

  const handleCreatePost = async () => {
    if (loading) return;
    if (!postDescription && !selectedFile) {
      alert("Write something or select a photo");
      return;
    }
    const formData = new FormData();
    formData.append("title", postDescription);
    formData.append("description", postDescription);
    formData.append("isPublished", true);
    if (selectedFile) formData.append("postFile", selectedFile);
    try {
      setLoading(true);
      await API.post("/posts/", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Post uploaded successfully");
      resetAll();
    } catch (err) {
      console.error(err);
      alert("Post upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVideo = async () => {
    if (loading) return;
    if (!selectedVideo) {
      alert("Please select a video");
      return;
    }
    const formData = new FormData();
    formData.append("title", videoDescription);
    formData.append("description", videoDescription);
    formData.append("category", "entertainment");
    formData.append("isPublished", true);
    formData.append("videoUrl", selectedVideo);
    try {
      setLoading(true);
      await API.post("/videos/create", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Video uploaded successfully");
      resetAll();
    } catch (err) {
      console.error(err);
      alert("Video upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handelSubmitallPosts = () => {
    if (postType === "video") handleCreateVideo();
    else handleCreatePost();
  };

  const resetAll = () => {
    if (previewVideo) URL.revokeObjectURL(previewVideo);
    setShowPostBox(false);
    setPostDescription("");
    setVideoDescription("");
    setSelectedFile(null);
    setSelectedVideo(null);
    setImagePreview(null);
    setPreviewVideo(null);
  };

  const modalTitle = {
    text: "What's on your mind?",
    photo: "Share a Photo",
    video: "Upload a Video",
  }[postType];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

        .upper-feed {
          font-family: 'Syne', sans-serif;
          max-width: 480px;
          margin: 16px auto 0;
          background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px;
          padding: 20px 18px 16px;
          box-shadow: 0 4px 30px rgba(0,0,0,0.4);
        }

        /* ✅ User info row — avatar + greeting */
        .upper-feed-user-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
        }

        .upper-feed-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          object-fit: cover;
          border: 2.5px solid rgba(6,182,212,0.45);
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.2s, transform 0.2s;
        }
        .upper-feed-avatar:hover {
          border-color: #06b6d4;
          transform: scale(1.05);
        }

        .upper-feed-user-info {
          flex: 1;
        }

        .upper-feed-username {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.85);
          margin-bottom: 2px;
        }

        .upper-feed-subtitle {
          font-size: 11px;
          color: rgba(255,255,255,0.28);
          font-weight: 500;
        }

        /* ✅ Big textarea-style input like FB */
        .upper-feed-input-box {
          width: 100%;
          min-height: 52px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          display: flex;
          align-items: center;
          padding: 14px 18px;
          font-size: 15px;
          font-family: 'Syne', sans-serif;
          color: rgba(255,255,255,0.28);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          box-sizing: border-box;
          letter-spacing: 0.01em;
        }
        .upper-feed-input-box:hover {
          background: rgba(6,182,212,0.06);
          border-color: rgba(6,182,212,0.2);
          color: rgba(255,255,255,0.45);
        }

        /* ✅ Divider */
        .upper-feed-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 14px 0;
        }

        /* ✅ Action buttons row */
        .upper-feed-actions {
          display: flex;
          gap: 6px;
        }

        .media-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 0;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.4);
          transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
          letter-spacing: 0.02em;
        }
        .media-btn svg { font-size: 20px; }
        .media-btn:hover { transform: translateY(-1px); }
        .media-btn.photo:hover {
          background: rgba(6,182,212,0.12);
          color: #06b6d4;
          border-color: rgba(6,182,212,0.3);
        }
        .media-btn.video:hover {
          background: rgba(168,85,247,0.12);
          color: #a855f7;
          border-color: rgba(168,85,247,0.3);
        }
        .media-btn.feeling:hover {
          background: rgba(251,191,36,0.1);
          color: #fbbf24;
          border-color: rgba(251,191,36,0.25);
        }

        /* MODAL */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          z-index: 40;
        }

        .modal-box {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 50;
          width: 92%;
          max-width: 460px;
          max-height: 90vh;
          overflow-y: auto;
          background: linear-gradient(160deg, #1e293b, #0f172a);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 32px 100px rgba(0,0,0,0.7);
          animation: modalIn 0.22s ease;
        }
        .modal-box::-webkit-scrollbar { width: 4px; }
        .modal-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        @keyframes modalIn {
          from { opacity:0; transform:translate(-50%,-52%) scale(0.95); }
          to { opacity:1; transform:translate(-50%,-50%) scale(1); }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .modal-title {
          font-size: 18px;
          font-weight: 800;
          color: #e2e8f0;
          letter-spacing: -0.01em;
        }
        .modal-close {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: none;
          color: rgba(255,255,255,0.5);
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .modal-close:hover { background: rgba(255,255,255,0.12); color: #fff; }

        /* Modal user row */
        .modal-user-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .modal-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(6,182,212,0.35);
        }
        .modal-username {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.85);
        }
        .modal-audience {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          margin-top: 2px;
        }

        .modal-textarea {
          width: 100%;
          background: transparent;
          border: none;
          border-radius: 0;
          color: rgba(255,255,255,0.85);
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          padding: 0;
          resize: none;
          outline: none;
          box-sizing: border-box;
          margin-bottom: 16px;
          line-height: 1.6;
        }
        .modal-textarea::placeholder { color: rgba(255,255,255,0.2); }

        .modal-file-zone {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          margin-bottom: 14px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .modal-file-zone:hover {
          border-color: rgba(6,182,212,0.35);
          background: rgba(6,182,212,0.04);
        }
        .modal-file-zone-text {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          font-weight: 600;
          margin-top: 8px;
        }
        .modal-file-input {
          display: none;
        }

        .modal-preview-img {
          width: 100%;
          aspect-ratio: 4/5;
          object-fit: cover;
          border-radius: 16px;
          border: 1px solid rgba(6,182,212,0.2);
          margin-bottom: 14px;
          display: block;
        }

        .modal-preview-video {
          width: 100%;
          max-height: 240px;
          border-radius: 16px;
          border: 1px solid rgba(168,85,247,0.2);
          margin-bottom: 14px;
          display: block;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .btn-cancel {
          padding: 10px 22px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-cancel:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.8); }

        .btn-post {
          padding: 10px 28px;
          border-radius: 12px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border: none;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 20px rgba(6,182,212,0.35);
          letter-spacing: 0.03em;
        }
        .btn-post:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .btn-post:disabled {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.25);
          box-shadow: none;
          cursor: not-allowed;
        }
      `}</style>

      <div className="upper-feed">
        {/* User info row */}
        <div className="upper-feed-user-row">
          <img
            src={mydetails?.avatar}
            alt="profile"
            className="upper-feed-avatar"
            onClick={() => navigate("/profile")}
          />
          <div className="upper-feed-user-info">
            <div className="upper-feed-username">
              @{mydetails?.username || "you"}
            </div>
            <div className="upper-feed-subtitle">
              Share something with your followers
            </div>
          </div>
        </div>

        {/* Big input box */}
        <div
          className="upper-feed-input-box"
          onClick={() => {
            setPostType("text");
            setShowPostBox(true);
          }}
        >
          What's on your mind, {mydetails?.username?.split(" ")[0] || "friend"}?
        </div>

        <div className="upper-feed-divider" />

        {/* Action buttons */}
        <div className="upper-feed-actions">
          <div
            className="media-btn photo"
            onClick={() => {
              setPostType("photo");
              setShowPostBox(true);
            }}
          >
            <IoMdPhotos /> Photo
          </div>
          <div
            className="media-btn video"
            onClick={() => {
              setPostType("video");
              setShowPostBox(true);
            }}
          >
            <RiVideoUploadFill /> Video
          </div>
          <div
            className="media-btn feeling"
            onClick={() => {
              setPostType("text");
              setShowPostBox(true);
            }}
          >
            <MdOutlineEmojiEmotions /> Feeling
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showPostBox && (
        <>
          <div className="modal-backdrop" onClick={resetAll} />
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">{modalTitle}</span>
              <button className="modal-close" onClick={resetAll}>
                <IoClose />
              </button>
            </div>

            {/* Modal user info */}
            <div className="modal-user-row">
              <img
                src={mydetails?.avatar}
                className="modal-avatar"
                alt="avatar"
              />
              <div>
                <div className="modal-username">@{mydetails?.username}</div>
                <div className="modal-audience">🌍 Public</div>
              </div>
            </div>

            {/* TEXT */}
            {postType === "text" && (
              <textarea
                className="modal-textarea"
                rows={5}
                placeholder="Share your thoughts..."
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
              />
            )}

            {/* PHOTO */}
            {postType === "photo" && (
              <>
                {!imagePreview ? (
                  <label className="modal-file-zone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="modal-file-input"
                    />
                    <IoMdPhotos
                      style={{ fontSize: 36, color: "rgba(255,255,255,0.2)" }}
                    />
                    <div className="modal-file-zone-text">
                      Click to add photos
                    </div>
                  </label>
                ) : (
                  <img
                    src={imagePreview}
                    className="modal-preview-img"
                    alt="preview"
                  />
                )}
                <textarea
                  className="modal-textarea"
                  rows={3}
                  placeholder="Say something about this photo..."
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                />
              </>
            )}

            {/* VIDEO */}
            {postType === "video" && (
              <>
                {!previewVideo ? (
                  <label className="modal-file-zone">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                      className="modal-file-input"
                    />
                    <RiVideoUploadFill
                      style={{ fontSize: 36, color: "rgba(255,255,255,0.2)" }}
                    />
                    <div className="modal-file-zone-text">
                      Click to upload video
                    </div>
                  </label>
                ) : (
                  <video
                    src={previewVideo}
                    controls
                    className="modal-preview-video"
                  />
                )}
                <textarea
                  className="modal-textarea"
                  rows={3}
                  placeholder="Add a description..."
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                />
              </>
            )}

            <div className="modal-footer">
              <button className="btn-cancel" onClick={resetAll}>
                Cancel
              </button>
              <button
                className="btn-post"
                onClick={handelSubmitallPosts}
                disabled={loading}
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default UpperFeedpage;
