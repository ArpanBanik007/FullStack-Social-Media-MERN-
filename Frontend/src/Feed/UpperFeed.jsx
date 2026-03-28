import { IoMdPhotos } from "react-icons/io";
import { RiVideoUploadFill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchMydetils } from "../slices/mydetails.slice";

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
      await axios.post("http://localhost:8000/api/v1/posts/", formData, {
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
      await axios.post("http://localhost:8000/api/v1/videos/create", formData, {
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
          margin: 12px auto 0;
          background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.35);
        }

        .upper-feed-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .upper-feed-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(6,182,212,0.35);
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.2s;
        }
        .upper-feed-avatar:hover { border-color: #06b6d4; }

        .upper-feed-input {
          flex: 1;
          height: 42px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          font-size: 13px;
          font-family: 'Syne', sans-serif;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .upper-feed-input:hover {
          background: rgba(6,182,212,0.08);
          border-color: rgba(6,182,212,0.25);
          color: rgba(255,255,255,0.5);
        }

        .upper-feed-actions {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 14px;
        }

        .media-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 0;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.4);
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .media-btn svg { font-size: 18px; }
        .media-btn.photo:hover { background: rgba(6,182,212,0.1); color: #06b6d4; border-color: rgba(6,182,212,0.25); }
        .media-btn.video:hover { background: rgba(168,85,247,0.1); color: #a855f7; border-color: rgba(168,85,247,0.25); }

        /* MODAL */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(6px);
          z-index: 40;
        }

        .modal-box {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 50;
          width: 90%;
          max-width: 440px;
          background: linear-gradient(160deg, #1e293b, #0f172a);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          padding: 24px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.6);
          animation: modalIn 0.22s ease;
        }
        @keyframes modalIn {
          from { opacity:0; transform:translate(-50%,-52%) scale(0.96); }
          to { opacity:1; transform:translate(-50%,-50%) scale(1); }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .modal-title {
          font-size: 17px;
          font-weight: 800;
          color: #e2e8f0;
        }
        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 8px;
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
        .modal-close:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .modal-textarea {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          color: rgba(255,255,255,0.85);
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          padding: 14px;
          resize: none;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
          margin-bottom: 14px;
        }
        .modal-textarea:focus { border-color: rgba(6,182,212,0.4); }
        .modal-textarea::placeholder { color: rgba(255,255,255,0.22); }

        .modal-file-input {
          display: block;
          width: 100%;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 12px;
          font-family: 'Syne', sans-serif;
        }
        .modal-file-input::file-selector-button {
          background: rgba(6,182,212,0.15);
          border: 1px solid rgba(6,182,212,0.3);
          color: #06b6d4;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          margin-right: 10px;
          transition: background 0.2s;
        }
        .modal-file-input::file-selector-button:hover { background: rgba(6,182,212,0.25); }

        .modal-preview-img {
          width: 100%;
          max-height: 240px;
          object-fit: cover;
          border-radius: 14px;
          border: 1px solid rgba(6,182,212,0.2);
          margin-bottom: 12px;
          display: block;
        }

        .modal-preview-video {
          width: 100%;
          max-height: 220px;
          border-radius: 14px;
          border: 1px solid rgba(168,85,247,0.2);
          margin-bottom: 12px;
          display: block;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 6px;
        }

        .btn-cancel {
          padding: 9px 20px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-cancel:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.8); }

        .btn-post {
          padding: 9px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border: none;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 16px rgba(6,182,212,0.3);
        }
        .btn-post:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-post:disabled { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.3); box-shadow: none; cursor: not-allowed; }
      `}</style>

      <div className="upper-feed">
        {/* INPUT ROW */}
        <div className="upper-feed-top">
          <img
            src={mydetails?.avatar}
            alt="profile"
            className="upper-feed-avatar"
            onClick={() => navigate("/profile")}
          />
          <div
            className="upper-feed-input"
            onClick={() => {
              setPostType("text");
              setShowPostBox(true);
            }}
          >
            What's on your mind?
          </div>
        </div>

        {/* ACTION BUTTONS */}
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="modal-file-input"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="modal-preview-img"
                    alt="preview"
                  />
                )}
                <textarea
                  className="modal-textarea"
                  rows={2}
                  placeholder="Say something about this photo..."
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                />
              </>
            )}

            {/* VIDEO */}
            {postType === "video" && (
              <>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="modal-file-input"
                />
                {previewVideo && (
                  <video
                    src={previewVideo}
                    controls
                    className="modal-preview-video"
                  />
                )}
                <textarea
                  className="modal-textarea"
                  rows={2}
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
