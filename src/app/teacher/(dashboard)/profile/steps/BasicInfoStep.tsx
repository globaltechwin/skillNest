"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface BasicInfoData {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  location: string;
}

interface BasicInfoStepProps {
  data: BasicInfoData;
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string[]> | null;
  profileImageUrl?: string | null;
  profilePhotoUrl?: string | null;
  onPhotoUploaded?: (url: string) => void;
}

function getFieldError(
  errors: Record<string, string[]> | null | undefined,
  field: string
): string | undefined {
  if (!errors) return undefined;
  return errors[field]?.[0];
}

export function BasicInfoStep({ data, onChange, errors, profileImageUrl, profilePhotoUrl, onPhotoUploaded }: BasicInfoStepProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayPhoto = profilePhotoUrl || profileImageUrl;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        onPhotoUploaded?.(data.url);
      } else {
        alert(data.error || "Failed to upload photo");
      }
    } catch {
      alert("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Basic Information
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us about yourself. This information will be visible to students.
        </p>
      </div>

      {/* Profile Photo */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="size-20 rounded-full bg-muted overflow-hidden flex-shrink-0">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="Profile"
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {data.firstName ? data.firstName[0].toUpperCase() : "?"}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 className="size-5 text-white animate-spin" />
            ) : (
              <Camera className="size-5 text-white" />
            )}
          </button>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Profile Photo</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-xs text-primary hover:underline disabled:opacity-50"
          >
            {uploading ? "Uploading..." : profilePhotoUrl ? "Change photo" : "Upload photo"}
          </button>
          <p className="text-xs text-muted-foreground mt-0.5">
            JPG, PNG or WebP. Max 5MB.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            placeholder="Enter your first name"
          />
          {getFieldError(errors, "firstName") && (
            <p className="text-xs text-destructive">
              {getFieldError(errors, "firstName")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+91 12345 67890"
          />
          {getFieldError(errors, "phone") && (
            <p className="text-xs text-destructive">
              {getFieldError(errors, "phone")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            id="gender"
            value={data.gender}
            onChange={(e) => onChange("gender", e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">
          Location <span className="text-destructive">*</span>
        </Label>
        <Input
          id="location"
          value={data.location}
          onChange={(e) => onChange("location", e.target.value)}
          placeholder="e.g., Chennai, Tamil Nadu"
        />
        {getFieldError(errors, "location") && (
          <p className="text-xs text-destructive">
            {getFieldError(errors, "location")}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          City and state where you are based
        </p>
      </div>
    </div>
  );
}
