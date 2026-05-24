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
    text: "Broadcast Signal",
    photo: "Neural Image Link",
    video: "Stream Data Upload",
  }[postType];

  return (
    <>
      <style>{`
        /* ── Composer box ── */
        .upper-feed {
          background: var(--pluto-bg-card);
          border: 1px solid var(--pluto-border);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 12px;
        }

        /* ── Avatar + input row ── */
        .upper-feed-user-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .upper-feed-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--pluto-border);
          cursor: pointer;
          transition: border-color 0.2s ease;
          flex-shrink: 0;
        }
        .upper-feed-avatar:hover { border-color: var(--pluto-accent); }

        .upper-feed-input-box {
          flex: 1;
          height: 40px;
          background: var(--pluto-bg-input);
          border: 1px solid var(--pluto-border);
          border-radius: 9999px;
          display: flex;
          align-items: center;
          padding: 0 18px;
          color: var(--pluto-text-hint);
          font-size: 15px;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }
        .upper-feed-input-box:hover {
          border-color: rgba(34, 211, 238, 0.3);
        }

        /* ── Action buttons ── */
        .upper-feed-actions {
          display: flex;
          gap: 8px;
          padding-top: 14px;
          border-top: 1px solid var(--pluto-border);
        }

        .upper-media-btn {
          flex: 1;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid var(--pluto-border);
          color: var(--pluto-text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .upper-media-btn:hover {
          background: var(--pluto-bg-hover);
          color: var(--pluto-text-primary);
          border-color: rgba(34, 211, 238, 0.2);
        }
        .upper-media-btn svg { font-size: 16px; }

        /* ── Modal backdrop ── */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(10, 14, 26, 0.85);
          backdrop-filter: blur(6px);
          z-index: 2000;
        }

        /* ── Modal box ── */
        .modal-box {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 500px;
          background: var(--pluto-bg-card);
          border: 1px solid var(--pluto-border);
          border-radius: 16px;
          padding: 28px;
          z-index: 2001;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
          animation: modal-in 0.25s ease;
        }
        @keyframes modal-in {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1);    }
        }

        /* ── Modal textarea ── */
        .modal-textarea {
          width: 100%;
          background: var(--pluto-bg-input);
          border: 1px solid var(--pluto-border);
          border-radius: 10px;
          padding: 14px;
          color: var(--pluto-text-primary);
          font-family: inherit;
          font-size: 15px;
          resize: none;
          outline: none;
          margin: 18px 0;
          transition: border-color 0.2s ease;
        }
        .modal-textarea::placeholder { color: var(--pluto-text-hint); }
        .modal-textarea:focus { border-color: var(--pluto-accent); }

        /* ── Submit button ── */
        .btn-post-submit {
          width: 100%;
          height: 46px;
          background: var(--pluto-accent);
          border: none;
          border-radius: 10px;
          color: #0a0e1a;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: opacity 0.2s ease;
          letter-spacing: 0.03em;
        }
        .btn-post-submit:hover:not(:disabled) { opacity: 0.88; }
        .btn-post-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="upper-feed">
        <div className="upper-feed-user-row">
          <img
            src={mydetails?.avatar || "https://via.placeholder.com/150"}
            className="upper-feed-avatar"
            alt="avatar"
            onClick={() => navigate("/profile")}
          />
          <div
            className="upper-feed-input-box"
            onClick={() => {
              setPostType("text");
              setShowPostBox(true);
            }}
          >
            What's new in the nexus, {mydetails?.username?.split(" ")[0] || "Voyager"}?
          </div>
        </div>

        <div className="upper-feed-actions">
          <button className="upper-media-btn" onClick={() => { setPostType("photo"); setShowPostBox(true); }}>
            <IoMdPhotos /> <span>Neural Image</span>
          </button>
          <button className="upper-media-btn" onClick={() => { setPostType("video"); setShowPostBox(true); }}>
            <RiVideoUploadFill /> <span>Data Stream</span>
          </button>
          <button className="upper-media-btn" onClick={() => { setPostType("text"); setShowPostBox(true); }}>
            <MdOutlineEmojiEmotions /> <span>Energy</span>
          </button>
        </div>
      </div>

      {showPostBox && (
        <>
          <div className="modal-backdrop" onClick={resetAll} />
          <div className="modal-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--pluto-text-primary)" }}>
                {modalTitle}
              </h2>
              <button
                onClick={resetAll}
                style={{ background: "none", border: "none", color: "var(--pluto-text-secondary)", cursor: "pointer", fontSize: 22, display: "flex" }}
              >
                <IoClose />
              </button>
            </div>

            {postType === "text" && (
              <textarea
                className="modal-textarea"
                rows={5}
                placeholder="Synchronize your thoughts with the nexus..."
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
              />
            )}

            {postType === "photo" && (
              <div style={{ marginBottom: 0 }}>
                {!imagePreview ? (
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 36, border: "2px dashed var(--pluto-border)", borderRadius: 12, cursor: "pointer", marginTop: 18 }}>
                    <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />
                    <IoMdPhotos style={{ fontSize: 36, opacity: 0.4, marginBottom: 10, color: "var(--pluto-accent)" }} />
                    <span style={{ color: "var(--pluto-text-secondary)", fontSize: 14 }}>Upload Visual Data</span>
                  </label>
                ) : (
                  <img src={imagePreview} style={{ width: "100%", borderRadius: 10, border: "1px solid var(--pluto-border)", marginTop: 18 }} alt="preview" />
                )}
                <textarea
                  className="modal-textarea"
                  rows={3}
                  placeholder="Caption this neural link..."
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                />
              </div>
            )}

            {postType === "video" && (
              <div style={{ marginBottom: 0 }}>
                {!previewVideo ? (
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 36, border: "2px dashed var(--pluto-border)", borderRadius: 12, cursor: "pointer", marginTop: 18 }}>
                    <input type="file" accept="video/*" onChange={handleVideoSelect} style={{ display: "none" }} />
                    <RiVideoUploadFill style={{ fontSize: 36, opacity: 0.4, marginBottom: 10, color: "var(--pluto-accent)" }} />
                    <span style={{ color: "var(--pluto-text-secondary)", fontSize: 14 }}>Upload Motion Stream</span>
                  </label>
                ) : (
                  <video src={previewVideo} controls style={{ width: "100%", borderRadius: 10, marginTop: 18 }} />
                )}
                <textarea
                  className="modal-textarea"
                  rows={3}
                  placeholder="Data stream description..."
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                />
              </div>
            )}

            <button className="btn-post-submit" onClick={handelSubmitallPosts} disabled={loading}>
              {loading ? "Transmitting..." : "INITIATE BROADCAST"}
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default UpperFeedpage;
