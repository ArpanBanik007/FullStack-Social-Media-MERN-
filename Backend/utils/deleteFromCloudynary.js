import { v2 as cloudinary } from 'cloudinary';



export const deleteFromCloudinary = async (url) => {
  if (!url) return;

  const parts = url.split('/');
  const filenameWithExt = parts[parts.length - 1];
  const publicId = filenameWithExt.split('.')[0]; // abc123
  const folder = parts[parts.length - 2]; // foldername
  const fullPublicId = `${folder}/${publicId}`; // no extra space

  try {
    const result = await cloudinary.uploader.destroy(fullPublicId, {
      resource_type: "image", // fix: use "image" or "video"
    });
    return result;
  } catch (error) {
    console.error("❌ Cloudinary deletion failed:", error);
  }
};
