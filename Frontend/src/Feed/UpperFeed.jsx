import { IoMdPhotos } from "react-icons/io";
import { RiVideoUploadFill } from "react-icons/ri";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchMydetils } from "../slices/mydetails.slice";

function UpperFeedpage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // redux
  const { mydetails } = useSelector((state) => state.mydetails);

  // ---------------- STATES ----------------
  const [showPostBox, setShowPostBox] = useState(false);
  const [postType, setPostType] = useState("text");
  const [loading, setLoading] = useState(false);

  // text / photo
  const [postDescription, setPostDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // video
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoDescription, setVideoDescription] = useState("");
  const [previewVideo, setPreviewVideo] = useState(null);

  // ---------------- EFFECT ----------------
  useEffect(() => {
    if (!mydetails || Object.keys(mydetails).length === 0) {
      dispatch(fetchMydetils());
    }
  }, [dispatch, mydetails]);

  // ---------------- HANDLERS ----------------

  // image select
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // video select
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

  // create post (text / photo)
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

    if (selectedFile) {
      formData.append("postFile", selectedFile);
    }

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

  // create video
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

    // backend expects videoUrl
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

  // ---------------- JSX ----------------
  return (
    <div className="flex justify-center w-full mt-2">
      {/* FEED INPUT */}
      <div className="w-full max-w-lg bg-cyan-400 rounded-xl p-3 shadow-md">
        <div className="flex items-center gap-2">
          <img
            src={mydetails?.avatar}
            alt="profile"
            onClick={() => navigate("/profile")}
            className="h-12 w-12 rounded-full cursor-pointer"
          />

          <div
            onClick={() => {
              setPostType("text");
              setShowPostBox(true);
            }}
            className="bg-cyan-200 h-10 w-full rounded-xl flex items-center px-4 cursor-pointer"
          >
            What's on your mind...
          </div>
        </div>

        <div className="flex justify-evenly text-3xl mt-3 text-slate-800">
          <IoMdPhotos
            onClick={() => {
              setPostType("photo");
              setShowPostBox(true);
            }}
            className="cursor-pointer hover:text-white"
          />
          <RiVideoUploadFill
            onClick={() => {
              setPostType("video");
              setShowPostBox(true);
            }}
            className="cursor-pointer hover:text-white"
          />
        </div>
      </div>

      {/* MODAL */}
      {showPostBox && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={resetAll}
          />

          <div
            className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-md
            -translate-x-1/2 -translate-y-1/2 rounded-xl
            bg-slate-900 p-6 shadow-2xl border border-slate-700"
          >
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">
              {postType === "text" && "Create Post"}
              {postType === "photo" && "Create Photo Post"}
              {postType === "video" && "Upload Video"}
            </h2>

            {/* TEXT */}
            {postType === "text" && (
              <textarea
                className="w-full rounded-lg bg-slate-800 text-white
                p-3 mb-4 resize-none border border-slate-700
                focus:outline-none focus:ring-2 focus:ring-cyan-400"
                rows={4}
                placeholder="What's on your mind?"
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
                  className="block w-full text-sm text-gray-300 mb-3"
                />

                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="w-full max-h-60 object-center rounded-lg
                    border border-cyan-400 mb-3"
                    alt="preview"
                  />
                )}

                <textarea
                  className="w-full rounded-lg bg-slate-800 text-white
                  p-3 resize-none border border-slate-700
                  focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
                  className="block w-full text-sm text-gray-300 mb-3"
                />

                {previewVideo && (
                  <video
                    src={previewVideo}
                    controls
                    className="w-full max-h-60 rounded-lg
                    border border-cyan-400 mb-3"
                  />
                )}

                <textarea
                  className="w-full rounded-lg bg-slate-800 text-white
                  p-3 resize-none border border-slate-700
                  focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  rows={2}
                  placeholder="Video description..."
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                />
              </>
            )}

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={resetAll}
                className="px-4 py-1.5 rounded-md
                bg-slate-600 hover:bg-slate-500 text-white"
              >
                Cancel
              </button>

              <button
                onClick={handelSubmitallPosts}
                disabled={loading}
                className={`px-4 py-1.5 rounded-md font-medium text-white
                ${
                  loading
                    ? "bg-slate-500 cursor-not-allowed"
                    : "bg-cyan-500 hover:bg-cyan-600"
                }`}
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UpperFeedpage;
