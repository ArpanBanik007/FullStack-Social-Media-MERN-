import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
import { log } from 'console';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("API Key:",  process.env.CLOUDINARY_API_KEY);
// console.log("API Secret:",  process.env.CLOUDINARY_API_SECRET);



const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // File uploaded successfully
       // console.log("File uploaded to Cloudinary:", response.url);

        // Delete the local file after successful upload
        fs.unlinkSync(localFilePath);
        return response;

        
    } catch (error) {
        console.error("Cloudinary upload failed:", error);

        // Attempt to delete the local file even if upload fails
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
            console.error("Failed to delete local file:", unlinkError);
        }

        return null;
    }
};



// const uploadOnCloudinary = async (
//   localFilePath,
//   folder = "",
//   resourceType = "auto"
// ) => {
//   try {
//     if (!localFilePath) return null;

//     let response;

//     if (resourceType === "video") {
//       response = await cloudinary.uploader.upload(localFilePath, {
//         resource_type: "video",
//         folder,
//          chunk_size: 6 * 1024 * 1024,
//         timeout: 120000,
//       });
//       console.log(response);
      
//     } else {
//       response = await cloudinary.uploader.upload(localFilePath, {
//         resource_type: "image",
//         folder,
//       });
//     }

//    // fs.unlinkSync(localFilePath); // ✅ ONLY HERE
//     return response;

//   } catch (error) {
//     console.error("Cloudinary upload failed:", error);

//     if (fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }

//     return null;
//   }
// };


// export { uploadOnCloudinary };

// const uploadOnCloudinary = async (localFilePath, folder, resourceType) => {
//   if (!localFilePath) return null;

//   try {
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: resourceType,
//       folder,
//       chunk_size: 6 * 1024 * 1024,
//       timeout: 120000,
//     });

//     return response;

//   } catch (error) {
//     console.error("Cloudinary upload failed:", error);
//     return null;
//   }
// };

 export { uploadOnCloudinary };
