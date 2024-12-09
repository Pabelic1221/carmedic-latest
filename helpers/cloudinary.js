import { Cloudinary } from "@cloudinary/url-gen";

/**
 * Configures the Cloudinary instance
 */
const cloudinary = new Cloudinary({
  cloud: {
    cloudName: "ds0znvcbn",
    apiKey: 852191926298842,
    apiSecret: "faRFvT87DEoSpRi9lQMG4w-nyFc",
  },
  url: {
    secure: true, // Enable HTTPS
  },
});

/**
 * Uploads an image to Cloudinary using unsigned uploads.
 * @param {string} imageUri - The local URI of the image to upload.
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
export const uploadImageToCloudinary = async (imageUri) => {
  const cloudName = "ds0znvcbn"; // Replace with your Cloudinary cloud name
  const uploadPreset = "carmedic"; // Replace with your unsigned upload preset

  try {
    if (!imageUri) {
      throw new Error("Invalid image URI provided.");
    }

    const data = new FormData();
    data.append("file", {
      uri: imageUri,
      type: "image/jpeg", // Adjust type based on your image format
      name: "upload.jpg", // Default file name
    });
    data.append("upload_preset", uploadPreset);

    console.log("Uploading image to Cloudinary:", imageUri);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${result.error.message}`);
    }

    console.log("Cloudinary upload successful. Secure URL:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};
