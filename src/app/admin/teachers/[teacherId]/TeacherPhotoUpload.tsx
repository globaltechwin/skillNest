"use client";

import { useState, useRef, useTransition } from "react";
import { Camera, Upload, X, Check } from "lucide-react";
import { uploadTeacherPhoto } from "../../actions";

type Props = {
  teacherUserId: string;
  currentPhotoUrl: string | null;
  teacherName: string;
};

export function TeacherPhotoUpload({ teacherUserId, currentPhotoUrl, teacherName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("File must be an image (JPEG, PNG, WebP, or GIF).");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("photo", selectedFile);

      const result = await uploadTeacherPhoto(teacherUserId, formData);

      if (result.success) {
        setSuccess(true);
        setPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(result.error);
        setPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayUrl = preview || currentPhotoUrl;

  return (
    <div className="space-y-3">
      <div className="relative group">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={teacherName}
            className="size-28 rounded-full object-cover ring-2 ring-border"
          />
        ) : (
          <div className="size-28 rounded-full bg-muted flex items-center justify-center ring-2 ring-border">
            <span className="text-2xl font-bold text-muted-foreground">
              {teacherName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer disabled:cursor-not-allowed"
        >
          <Camera className="size-5 text-white" />
        </button>

      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpload}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isPending ? (
              <>
                <Upload className="size-3.5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                Save Photo
              </>
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted disabled:opacity-50 transition-colors"
          >
            <X className="size-3.5" />
            Cancel
          </button>
        </div>
      )}

      {success && (
        <p className="text-xs text-emerald-600 font-medium">Photo uploaded successfully!</p>
      )}

      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}

      {!preview && !success && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted disabled:opacity-50 transition-colors"
        >
          <Camera className="size-3.5" />
          {currentPhotoUrl ? "Change Photo" : "Upload Photo"}
        </button>
      )}
    </div>
  );
}
