'use client';

import React from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Camera, RefreshCw } from 'lucide-react';

interface CloudinaryUploadProps {
    onUploadSuccess: (url: string) => void;
    currentImage?: string | null;
}

export function CloudinaryUpload({ onUploadSuccess, currentImage }: CloudinaryUploadProps) {
    return (
        <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onSuccess={(result: any) => {
                if (result.info && result.info.secure_url) {
                    onUploadSuccess(result.info.secure_url);
                }
            }}
            options={{
                maxFiles: 1,
                sources: ['local', 'camera'],
                resourceType: 'image',
            }}
        >
            {({ open, isLoading }) => {
                return (
                    <div
                        onClick={() => open()}
                        className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${currentImage
                            ? 'border-emerald-300 bg-emerald-50/50 hover:border-emerald-500 text-emerald-700 hover:text-emerald-900'
                            : 'border-rose-300 bg-rose-50/30 hover:border-rose-500 text-rose-600 hover:text-rose-900'
                            }`}
                    >
                        {isLoading ? (
                            <RefreshCw className="animate-spin" size={32} />
                        ) : (
                            <>
                                <Camera size={32} />
                                <span className="font-semibold text-sm">
                                    {currentImage ? '✓ Evidence Photo Uploaded' : '⚠️ Evidence Photo Required *'}
                                </span>
                                <span className="text-xs opacity-75">
                                    {currentImage ? 'Click to change' : 'Click to upload'}
                                </span>
                            </>
                        )}
                    </div>
                );
            }}
        </CldUploadWidget>
    );
}
