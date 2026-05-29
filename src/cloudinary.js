// Cloudinary configuration using environment variables
const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Function to upload media to Cloudinary
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};