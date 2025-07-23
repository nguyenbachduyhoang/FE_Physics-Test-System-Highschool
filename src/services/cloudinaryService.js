// 🌤️ Cloudinary Service for image uploads
const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ddv96e1lz',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'phygens-upload',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '224812153778986',
  folder: 'phygens-uploads' // Thư mục lưu trữ
};

/**
 * 📤 Upload image to Cloudinary
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - Cloudinary URL
 */
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    console.log('🌤️ Starting Cloudinary upload:', file.name);

    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided');
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported. Use JPEG, PNG, GIF, or WebP');
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
    
    // Optional parameters
    if (options.folder || CLOUDINARY_CONFIG.folder) {
      formData.append('folder', options.folder || CLOUDINARY_CONFIG.folder);
    }
    
    if (options.public_id) {
      formData.append('public_id', options.public_id);
    }

    // Auto-transformations for optimization
    const transformation = options.transformation || 'q_auto,f_auto,c_limit,w_1920,h_1080';
    if (transformation) {
      formData.append('transformation', transformation);
    }

    // Tags for organization
    const tags = options.tags || ['phygens', 'essay-image', 'physics'];
    formData.append('tags', tags.join(','));

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    
    console.log('✅ Cloudinary upload successful:', result.secure_url);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      originalUrl: result.url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type,
      createdAt: result.created_at
    };

  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * 🖼️ Generate optimized Cloudinary URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Image transformations
 * @returns {string} - Optimized URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    crop = 'limit',
    quality = 'auto',
    format = 'auto',
    gravity = 'center'
  } = transformations;

  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  const transformString = `w_${width},h_${height},c_${crop},q_${quality},f_${format},g_${gravity}`;
  
  return `${baseUrl}/${transformString}/${publicId}`;
};

/**
 * 🗑️ Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    console.log('🗑️ Deleting from Cloudinary:', publicId);

    // Note: Deletion requires authentication, should be done via backend
    // This is a placeholder for frontend reference

    let API_BASE_URL = 'https://be-phygens.onrender.com';
    
    async function checkBackend() {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify`);
        if (!res.ok) throw new Error('BE deploy lỗi');
      } catch (e) {
        console.log(e);
        API_BASE_URL = 'http://localhost:5298';
      }
    }
    
    // Gọi check khi khởi động app
    checkBackend();
    const response = await fetch(`${API_BASE_URL}/upload/cloudinary/deletion`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ publicId })
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    console.log('✅ Cloudinary deletion successful');
    return true;

  } catch (error) {
    console.error('❌ Cloudinary deletion error:', error);
    return false;
  }
};

/**
 * 📋 Validate Cloudinary configuration
 * @returns {Object} - Configuration status
 */
export const validateCloudinaryConfig = () => {
  const isConfigured = CLOUDINARY_CONFIG.cloudName === 'ddv96e1lz' && 
                      CLOUDINARY_CONFIG.uploadPreset === 'phygens-upload' &&
                      CLOUDINARY_CONFIG.apiKey === '224812153778986';
  
  return {
    isConfigured,
    cloudName: CLOUDINARY_CONFIG.cloudName,
    uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
    hasApiKey: !!CLOUDINARY_CONFIG.apiKey && CLOUDINARY_CONFIG.apiKey === '224812153778986',
    folder: CLOUDINARY_CONFIG.folder,
    status: isConfigured ? 'ready' : 'needs-setup'
  };
};

/**
 * 🔄 Smart upload with fallback
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - Image URL
 */
export const smartUploadWithCloudinary = async (file, options = {}) => {
  try {
    // Try Cloudinary first
    const result = await uploadToCloudinary(file, options);
    return result.url;
  } catch (cloudinaryError) {
    console.warn('⚠️ Cloudinary failed, trying fallback:', cloudinaryError.message);
    
    // Fallback to existing Firebase/Backend upload
    const { smartUpload } = await import('../quiz-uploads/firebaseStorage.js');
    return await smartUpload(file, options.folder || 'essay-images');
  }
};

export default {
  uploadToCloudinary,
  getOptimizedImageUrl,
  deleteFromCloudinary,
  validateCloudinaryConfig,
  smartUploadWithCloudinary
}; 