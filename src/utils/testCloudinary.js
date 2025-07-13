// 🧪 Test Cloudinary Configuration
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
    console.log('✅ Cloudinary is configured and ready!');
    console.log('🌐 Upload URL:', `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`);
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
    
    // Create a tiny test image (1x1 pixel PNG)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // Convert data URL to blob
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
    // Test 1: Configuration
    console.log('=== Test 1: Configuration ===');
    const config = testCloudinaryConfig();
    console.log('');
    
    if (!config.isConfigured) {
      console.log('⚠️ Configuration incomplete. Skipping upload test.');
      return { config, uploadTest: null };
    }
    
    // Test 2: Upload
    console.log('=== Test 2: Upload Test ===');
    const uploadResult = await testCloudinaryUpload();
    console.log('');
    
    console.log('🎉 All tests passed!');
    console.log('🌤️ Cloudinary is ready for production use!');
    
    return { config, uploadTest: uploadResult };
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    return { config: null, uploadTest: null, error: error.message };
  }
};

// Export for global testing
if (typeof window !== 'undefined') {
  window.testCloudinary = {
    config: testCloudinaryConfig,
    upload: testCloudinaryUpload,
    all: runCloudinaryTests
  };
  
  console.log('🧪 Cloudinary test utilities loaded!');
  console.log('Run tests: window.testCloudinary.all()');
}

export default {
  testCloudinaryConfig,
  testCloudinaryUpload,
  runCloudinaryTests
}; 