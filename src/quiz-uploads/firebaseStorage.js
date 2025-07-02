import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";

const storage = getStorage(app);

// Improved upload function with CORS handling
export const uploadFile = async (file, folder = "quiz-uploads") => {
  try {
    console.log(`🚀 Starting upload: ${file.name} to folder: ${folder}`);
    
    const uniqueName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `${folder}/${uniqueName}`);
    
    // Use resumable upload for better CORS handling
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        'uploadedBy': 'phygens-app',
        'uploadTime': new Date().toISOString()
      }
    });

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Progress monitoring
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`📊 Upload progress: ${progress.toFixed(1)}%`);
        }, 
        (error) => {
          console.error("❌ Upload error:", error);
          
          // Handle specific CORS errors
          if (error.code === 'storage/unauthorized' || 
              error.message.includes('CORS') || 
              error.message.includes('preflight')) {
            console.error("🚫 CORS Error detected. Trying fallback method...");
            
            // Fallback: Try direct upload without resumable
            uploadBytes(storageRef, file)
              .then(() => getDownloadURL(storageRef))
              .then(resolve)
              .catch(reject);
          } else {
            reject(error);
          }
        }, 
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("✅ Upload successful! URL:", downloadURL);
            resolve(downloadURL);
          } catch (urlError) {
            console.error("❌ Error getting download URL:", urlError);
            reject(urlError);
          }
        }
      );
    });
  } catch (error) {
    console.error("❌ Upload file error:", error);
    throw error;
  }
};

// Alternative upload method using direct backend proxy
export const uploadFileViaBackend = async (file, folder = "quiz-uploads") => {
  try {
    console.log(`🔄 Using backend proxy upload for: ${file.name}`);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // Get API base URL dynamically
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
      (window.location.hostname === 'localhost' ? 'http://localhost:5298' : 'https://be-phygens-production.up.railway.app');
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error("❌ Backend upload error:", error);
    throw error;
  }
};

// Smart upload function that tries multiple methods
export const smartUpload = async (file, folder = "quiz-uploads") => {
  try {
    // First try Firebase direct upload
    return await uploadFile(file, folder);
  } catch (firebaseError) {
    console.warn("⚠️ Firebase upload failed, trying backend proxy...");
    
    try {
      // Fallback to backend proxy
      return await uploadFileViaBackend(file, folder);
    } catch (backendError) {
      console.error("❌ All upload methods failed");
      throw new Error(`Upload failed: Firebase (${firebaseError.message}), Backend (${backendError.message})`);
    }
  }
};