import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaPlay } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { syncVideoLike } from "../slices/video.like.slice";

function UserAllVideos({ userId }) {
  const dispatch = useDispatch();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/videos/user/${userId}/videos`,
          { withCredentials: true },
        );
        const fetchedVideos = res.data?.data?.videos || [];
        setVideos(fetchedVideos);
        fetchedVideos.forEach(v => {
           if (v.userLiked !== undefined) {
               dispatch(syncVideoLike({ videoId: v._id, isLiked: v.userLiked }));
           }
        });
      } catch (err) {
        console.error("Video fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchVideos();
  }, [userId]);

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&display=swap');
          @keyframes shimUV { 0%{background-position:-300px 0} 100%{background-position:300px 0} }
          .skUV { background:linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%); background-size:300px 100%; animation:shimUV 1.3s infinite linear; border-radius:14px; }
        `}</style>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skUV" style={{ aspectRatio: "9/16" }} />
          ))}
        </div>
      </>
    );
  }

  if (videos.length === 0) {
    return (
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          textAlign: "center",
          padding: "50px 20px",
          color: "rgba(255,255,255,0.25)",
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 10 }}>🎬</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          No videos yet
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

        .uv-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; font-family:'Syne',sans-serif; }

        .uv-card { position:relative; background:#0f172a; border-radius:16px; overflow:hidden; aspect-ratio:9/16; cursor:pointer; border:1px solid rgba(255,255,255,0.06); transition:transform 0.2s, box-shadow 0.2s; }
        .uv-card:hover { transform:scale(1.02); box-shadow:0 8px 30px rgba(0,0,0,0.5); }

        .uv-card img, .uv-card video { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.3s; }
        .uv-card:hover img, .uv-card:hover video { transform:scale(1.05); }

        .uv-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 45%, transparent 70%); }

        .uv-play { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.15); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; font-size:14px; color:#fff; opacity:0; transition:opacity 0.2s, transform 0.2s; }
        .uv-card:hover .uv-play { opacity:1; transform:translate(-50%,-50%) scale(1.1); }

        .uv-info { position:absolute; bottom:0; left:0; right:0; padding:10px 10px 12px; }
        .uv-title { font-size:12px; font-weight:700; color:rgba(255,255,255,0.9); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:5px; }
        .uv-likes { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:rgba(255,255,255,0.45); }
        .uv-likes svg { font-size:10px; color:#f87171; }
      `}</style>

      <div className="uv-grid">
        {videos.map((video) => {
          const videoSrc = video.videourl
            ?.replace("/upload/", "/upload/f_mp4,vc_h264/")
            ?.replace("http://", "https://");

          return (
            <div
              key={video._id}
              className="uv-card"
              onClick={() => navigate(`/video/comments/${video._id}`)}
            >
              {video.thumbnail ? (
                <img src={video.thumbnail} alt={video.title} />
              ) : (
                <video src={`${videoSrc}#t=0.1`} preload="metadata" muted />
              )}
              <div className="uv-overlay" />
              <div className="uv-play">
                <FaPlay />
              </div>
              <div className="uv-info">
                <div className="uv-title">{video.title}</div>
                <div className="uv-likes">
                  <FaHeart /> {video.likes || 0}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default UserAllVideos;
