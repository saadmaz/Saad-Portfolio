/**
 * ImageUpload.tsx
 * ─────────────────────────────────────────────────────────────
 * Drag-and-drop / click image uploader for admin forms.
 *
 * BEFORE: POST /admin/upload (Express + multer) → Firebase Admin SDK → Storage
 * AFTER:  uploadImage() from services/storage.ts → Firebase Storage SDK directly
 *
 * No server needed. The Firebase Auth session (user is logged in as admin)
 * satisfies the Storage Security Rules which require request.auth != null.
 */

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '@/services/storage';
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label, className }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5 MB cap)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);

      // Upload directly to Firebase Storage — no backend involved
      const url = await uploadImage(file);
      onChange(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      toast.error(message);
    } finally {
      setIsUploading(false);
      // Reset file input so the same file can be re-uploaded if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
      )}

      <div className="relative group">
        {value ? (
          // ── Preview with Change / Remove overlay ──────────────
          <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => fileInputRef.current?.click()}
              >
                Change
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onChange('')}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          // ── Upload dropzone ───────────────────────────────────
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent/40 transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-1">
                  <Upload className="w-6 h-6 text-accent" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-accent font-bold">
                  Upload Media
                </span>
                <span className="text-[10px] text-muted-foreground italic">
                  JPG, PNG or WebP (Max 5MB)
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUpload;
