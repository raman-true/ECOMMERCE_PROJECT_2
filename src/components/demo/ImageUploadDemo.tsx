import React, { useState } from 'react';
import { ImageUpload } from '../ui/ImageUpload';
import { MultiImageUpload } from '../ui/MultiImageUpload';

/**
 * Demo component to test image upload functionality
 * Add this to any page to test the upload components
 */
export function ImageUploadDemo() {
  const [singleImage, setSingleImage] = useState<string>('');
  const [multipleImages, setMultipleImages] = useState<string[]>([]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Image Upload Demo</h2>
        
        {/* Single Image Upload */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Single Image Upload</h3>
          <p className="text-sm text-gray-600 mb-4">
            Used for categories and departments. Click to upload an image.
          </p>
          <ImageUpload
            value={singleImage}
            onChange={setSingleImage}
            bucket="images"
            folder="demo"
            maxSize={5}
          />
          {singleImage && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Uploaded URL:</p>
              <p className="text-xs text-blue-600 break-all">{singleImage}</p>
            </div>
          )}
        </div>

        {/* Multiple Image Upload */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Multiple Image Upload</h3>
          <p className="text-sm text-gray-600 mb-4">
            Used for products. Upload multiple images at once.
          </p>
          <MultiImageUpload
            value={multipleImages}
            onChange={setMultipleImages}
            bucket="images"
            folder="demo"
            maxSize={5}
            maxImages={6}
          />
          {multipleImages.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600 mb-2">
                Uploaded {multipleImages.length} image(s):
              </p>
              <div className="space-y-1">
                {multipleImages.map((url, index) => (
                  <p key={index} className="text-xs text-blue-600 break-all">
                    {index + 1}. {url}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Testing Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Upload images and check if they appear in Supabase Storage</li>
            <li>• Test file validation (try uploading non-images or large files)</li>
            <li>• Verify images display correctly after upload</li>
            <li>• Test remove functionality</li>
            <li>• Check browser console for any errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
