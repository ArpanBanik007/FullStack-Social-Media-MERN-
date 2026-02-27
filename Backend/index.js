import dotenv from "dotenv"
import http from "http"
import { initSocket } from "./socket.js"
import connectDB from "./DB/index.js"
import app from "./app.js"
dotenv.config({
    path:"./.env"
})


const httpServer= http.createServer(app)

initSocket(httpServer)





connectDB()
.then(()=>{

// app.listen(process.env.PORT || 8000 ,()=>{
//     console.log(`server is running at ${process.env.PORT}`);
    
// })

// 

const PORT = process.env.PORT || 8000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
})
.catch((error)=>{console.log("MongoDB connection error",error);
})
