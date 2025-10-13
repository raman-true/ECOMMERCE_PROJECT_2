import React, { useState, useRef } from 'react';
import { Upload, X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from './Button';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  maxImages?: number;
  className?: string;
}

export function MultiImageUpload({
  value = [],
  onChange,
  bucket = 'images',
  folder = 'products',
  accept = 'image/*',
  maxSize = 5,
  maxImages = 10,
  className = ''
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setError(null);

    // Check if adding these files would exceed the limit
    if (value.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed. You can add ${maxImages - value.length} more.`);
      return;
    }

    // Validate files
    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is ${maxSize}MB.`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError(`File "${file.name}" is not an image.`);
        return;
      }
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      onChange([...value, ...uploadedUrls]);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const newUrls = value.filter((_, index) => index !== indexToRemove);
    onChange(newUrls);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxImages && (
        <div
          onClick={handleClick}
          className="w-full h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center"
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-600"></div>
              <p className="mt-2 text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-2">
                {value.length === 0 ? (
                  <Upload className="w-6 h-6 text-gray-400" />
                ) : (
                  <Plus className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                {value.length === 0 ? 'Click to upload images' : 'Add more images'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {value.length}/{maxImages} images • Max {maxSize}MB each
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
