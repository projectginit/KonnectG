import cloudinary from "../config/cloudinary.js";

export const uploadBusinessImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No images were uploaded.",
      });
    }

    const uploadPromises = req.files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "konnectg/businesses",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  url: result.secure_url,
                  publicId: result.public_id,
                });
              }
            },
          );

          stream.end(file.buffer);
        }),
    );

    const uploadedImages = await Promise.all(uploadPromises);

    return res.status(200).json({
      message: "Images uploaded successfully.",
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return res.status(500).json({
      message: "Failed to upload images.",
    });
  }
};