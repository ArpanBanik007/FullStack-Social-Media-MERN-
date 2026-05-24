import cookieParser from "cookie-parser";
import express from "express"
import cors from "cors"

const app = express();

app.set("trust proxy", 1);

// ✅ FIX: wildcard origin এর বদলে specific origins — credentials এর জন্য দরকার
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://pluto-alpha-ochre.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    // No origin (mobile apps, curl) allow করো
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // সব allow — production এ specific করতে পারো
    }
  },
  credentials: true, // ✅ cookie পাঠানোর জন্য দরকার
}));

app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true, limit: "10kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// importing routes
import userRoute from "./routes/user.routes.js"
import followRoute from "./routes/follow.routes.js"
import postRoute from "./routes/post.routes.js"
import likesRoute from "./routes/like.routes.js"
import videoRoute from "./routes/video.routes.js"
import watchRoutes from "./routes/watch.routes.js"
import commentsRoutes from "./routes/comment.routes.js"
import postcommentsRoutes from "./routes/post.comment.routes.js"
import videoViewRouter from "./routes/videoView.route.js"
import postViewRouter from "./routes/postView.router.js"
import searchRoute from "./routes/search.routes.js"
import messageRoute from "./routes/message.routes.js"

app.use("/api/v1/users", userRoute);
app.use("/api/v1/users/interactions", followRoute);
app.use("/api/v1/posts", postRoute);
app.use("/api/v1/likes", likesRoute);
app.use("/api/v1/videos", videoRoute);
app.use("/api/v1/watch", watchRoutes);
app.use("/api/v1/videos/comments", commentsRoutes);
app.use("/api/v1/posts/comments", postcommentsRoutes);
app.use("/api/v1/views/video", videoViewRouter);
app.use("/api/v1/views/post", postViewRouter);
app.use("/api/v1/search", searchRoute);
app.use("/api/v1/messages", messageRoute);


// Global Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export default app;
