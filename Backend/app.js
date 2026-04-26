import cookieParser from "cookie-parser";
import express from "express"
import cors from "cors"

const app = express();


// cors frontend

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));



app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true, limit: "10kb" }))// For nested object
app.use(express.static("public"))// Access for public file data to server 
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



// routes decleartion

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
