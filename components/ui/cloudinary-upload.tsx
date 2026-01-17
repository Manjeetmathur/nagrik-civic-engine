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
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""}
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
                        className="w-full h-40 border-2 border-dashed border-zinc-300 rounded-none flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-zinc-900 hover:bg-zinc-50 transition-all text-zinc-500 hover:text-zinc-900"
                    >
                        {isLoading ? (
                            <RefreshCw className="animate-spin" size={32} />
                        ) : (
                            <>
                                <Camera size={32} />
                                <span className="font-medium">
                                    {currentImage ? 'Change Evidence Photo' : 'Click to Upload Evidence'}
                                </span>
                            </>
                        )}
                    </div>
                );
            }}
        </CldUploadWidget>
    );
}
