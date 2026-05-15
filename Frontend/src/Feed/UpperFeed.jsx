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
        .upper-feed {
          background: rgba(22, 36, 58, 0.35);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 18px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }

        .upper-feed:hover {
          background: rgba(22, 36, 58, 0.45);
          border-color: rgba(0, 217, 255, 0.15);
        }

        .upper-feed-user-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .upper-feed-avatar {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          object-fit: cover;
          border: 1.5px solid var(--glass-border);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upper-feed-avatar:hover {
          border-color: var(--accent-primary);
          transform: scale(1.05);
        }

        .upper-feed-input-box {
          flex: 1;
          height: 44px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0.7;
        }

        .upper-feed-input-box:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(0, 217, 255, 0.2);
          opacity: 1;
        }

        .upper-feed-actions {
          display: flex;
          gap: 10px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--glass-border);
        }

        .upper-media-btn {
          flex: 1;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid transparent;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upper-media-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
        }

        .upper-media-btn.photo:hover { color: #00D9FF; background: rgba(0, 217, 255, 0.04); }
        .upper-media-btn.video:hover { color: #A855F7; background: rgba(168, 85, 247, 0.04); }
        .upper-media-btn.emoji:hover { color: #FBBF24; background: rgba(251, 191, 36, 0.04); }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(7, 17, 32, 0.8);
          backdrop-filter: blur(10px);
          z-index: 2000;
        }

        .modal-box {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 500px;
          background: var(--surface-elevated);
          border: 1px solid var(--glass-border);
          border-radius: 28px;
          padding: 30px;
          z-index: 2001;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          animation: modalScale 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes modalScale {
          from { opacity: 0; transform: translate(-50%, -45%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        .modal-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 16px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 16px;
          resize: none;
          outline: none;
          margin: 20px 0;
          transition: all 0.3s ease;
        }

        .modal-textarea:focus {
          border-color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.04);
        }

        .btn-post-submit {
          width: 100%;
          height: 50px;
          background: linear-gradient(to right, #00D9FF, #3b82f6);
          border: none;
          border-radius: 16px;
          color: white;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(0, 217, 255, 0.2);
        }

        .btn-post-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(0, 217, 255, 0.3);
        }
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
          <button className="upper-media-btn photo" onClick={() => { setPostType("photo"); setShowPostBox(true); }}>
            <IoMdPhotos /> <span>Neural Image</span>
          </button>
          <button className="upper-media-btn video" onClick={() => { setPostType("video"); setShowPostBox(true); }}>
            <RiVideoUploadFill /> <span>Data Stream</span>
          </button>
          <button className="upper-media-btn emoji" onClick={() => { setPostType("text"); setShowPostBox(true); }}>
            <MdOutlineEmojiEmotions /> <span>Energy</span>
          </button>
        </div>
      </div>

      {showPostBox && (
        <>
          <div className="modal-backdrop" onClick={resetAll} />
          <div className="modal-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{modalTitle}</h2>
              <button onClick={resetAll} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 24 }}>
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
              <div style={{ marginBottom: 20 }}>
                {!imagePreview ? (
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 40, border: "2px dashed var(--glass-border)", borderRadius: 20, cursor: "pointer" }}>
                    <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />
                    <IoMdPhotos style={{ fontSize: 40, opacity: 0.3, marginBottom: 12 }} />
                    <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Upload Visual Data</span>
                  </label>
                ) : (
                  <img src={imagePreview} style={{ width: "100%", borderRadius: 16, border: "1px solid var(--glass-border)" }} alt="preview" />
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
              <div style={{ marginBottom: 20 }}>
                {!previewVideo ? (
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 40, border: "2px dashed var(--glass-border)", borderRadius: 20, cursor: "pointer" }}>
                    <input type="file" accept="video/*" onChange={handleVideoSelect} style={{ display: "none" }} />
                    <RiVideoUploadFill style={{ fontSize: 40, opacity: 0.3, marginBottom: 12 }} />
                    <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Upload Motion Stream</span>
                  </label>
                ) : (
                  <video src={previewVideo} controls style={{ width: "100%", borderRadius: 16 }} />
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
