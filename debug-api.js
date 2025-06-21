import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug script to test the analyze API route
async function debugAnalyzeAPI() {
  console.log('🔍 Debug: Testing analyze API route');

  // Check if we have a test image
  const testImagePath = path.join(__dirname, 'test-image.jpg');

  if (!fs.existsSync(testImagePath)) {
    console.log(
      '⚠️  No test image found. Please place a test image named "test-image.jpg" in the project root.'
    );
    console.log(
      '   You can also modify this script to use a different image path.'
    );
    return;
  }

  try {
    console.log('📁 Reading test image...');
    const imageBuffer = fs.readFileSync(testImagePath);

    console.log('📤 Creating form data...');
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg',
    });

    console.log('🚀 Making request to /api/analyze...');
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData,
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('💥 Debug script error:', error);
  }
}

// Run the debug function
debugAnalyzeAPI();
