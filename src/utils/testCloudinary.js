import { validateCloudinaryConfig, uploadToCloudinary } from '../services/cloudinaryService';

/**
 * 🔍 Test Cloudinary configuration
 */
export const testCloudinaryConfig = () => {
  console.log('🌤️ Testing Cloudinary Configuration...');
  
  const config = validateCloudinaryConfig();
  
  console.log('📋 Configuration Status:', {
    cloudName: config.cloudName,
    uploadPreset: config.uploadPreset,
    hasApiKey: config.hasApiKey,
    folder: config.folder,
    status: config.status,
    isReady: config.isConfigured
  });

  if (config.isConfigured) {
    console.log('📁 Default folder:', config.folder);
  } else {
    console.log('⚠️ Cloudinary needs setup:');
    if (config.cloudName === 'ddv96e1lz') {
      console.log('✅ Cloud Name: OK');
    } else {
      console.log('❌ Cloud Name: Missing or incorrect');
    }
    
    if (config.uploadPreset === 'phygens-upload') {
      console.log('✅ Upload Preset: OK');
    } else {
      console.log('❌ Upload Preset: Missing or incorrect');
    }
    
    if (config.hasApiKey) {
      console.log('✅ API Key: OK');
    } else {
      console.log('❌ API Key: Missing or incorrect');
    }
  }

  return config;
};

/**
 * 🎯 Test upload with dummy data
 */
export const testCloudinaryUpload = async () => {
  try {
    console.log('🧪 Testing Cloudinary upload...');
    
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const response = await fetch(testImageData);
    const blob = await response.blob();
    const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
    
    console.log('📤 Uploading test image...');
    const result = await uploadToCloudinary(testFile, {
      folder: 'phygens-test',
      tags: ['test', 'phygens', 'config-check']
    });
    
    console.log('✅ Upload successful!', {
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      bytes: result.bytes
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
    throw error;
  }
};

/**
 * 🎮 Run complete test suite
 */
export const runCloudinaryTests = async () => {
  console.log('🚀 Starting Cloudinary Test Suite...\n');
  
  try {
    const config = testCloudinaryConfig();
    if (!config.isConfigured) {
      return { config, uploadTest: null };
    }
    
    const uploadResult = await testCloudinaryUpload();
    return { config, uploadTest: uploadResult };
    
  } catch (error) {
    return { config: null, uploadTest: null, error: error.message };
  }
};

if (typeof window !== 'undefined') {
  window.testCloudinary = {
    config: testCloudinaryConfig,
    upload: testCloudinaryUpload,
    all: runCloudinaryTests
  };
}

export default {
  testCloudinaryConfig,
  testCloudinaryUpload,
  runCloudinaryTests
}; 