import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB= async()=>{
    try {
       const connectionInstants= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB host : ${connectionInstants.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection failed",error)
        process.exit(1)
    }
}
export default connectDB