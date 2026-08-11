"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const LANGUAGES = [
  "English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali",
  "Marathi", "Gujarati", "Punjabi", "Urdu", "French", "German", "Spanish",
  "Mandarin", "Japanese", "Korean", "Arabic", "Portuguese", "Russian",
];

const LEVELS = [
  "Primary (1-5)", "Middle School (6-8)", "High School (9-10)",
  "Higher Secondary (11-12)", "Undergraduate", "Postgraduate", "Professional",
];

interface TeachingInfoData {
  bio: string;
  teachingApproach: string;
  teachingMode: string;
  offlineLocation: string;
  yearsOfExperience: number;
  languages: string;
  teachingLevels: string;
}

interface TeachingInfoStepProps {
  data: TeachingInfoData;
  onChange: (field: string, value: string | number) => void;
  errors?: Record<string, string[]> | null;
}

function getFieldError(
  errors: Record<string, string[]> | null | undefined,
  field: string
): string | undefined {
  if (!errors) return undefined;
  return errors[field]?.[0];
}

export function TeachingInfoStep({
  data,
  onChange,
  errors,
}: TeachingInfoStepProps) {
  const selectedLanguages = data.languages
    ? data.languages.split(", ").filter(Boolean)
    : [];
  const selectedLevels = data.teachingLevels
    ? data.teachingLevels.split(", ").filter(Boolean)
    : [];

  const toggleLanguage = (lang: string) => {
    const updated = selectedLanguages.includes(lang)
      ? selectedLanguages.filter((l) => l !== lang)
      : [...selectedLanguages, lang];
    onChange("languages", updated.join(", "));
  };

  const toggleLevel = (level: string) => {
    const updated = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level];
    onChange("teachingLevels", updated.join(", "));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Teaching Information
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Share your teaching experience and approach to help students understand
          your style.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">
          About / Bio <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="bio"
          value={data.bio}
          onChange={(e) => onChange("bio", e.target.value)}
          placeholder="Tell students about your teaching background, expertise, and what makes you a great tutor..."
          className="min-h-32"
        />
        <div className="flex items-center justify-between">
          {getFieldError(errors, "bio") ? (
            <p className="text-xs text-destructive">
              {getFieldError(errors, "bio")}
            </p>
          ) : (
            <span />
          )}
          <p className="text-xs text-muted-foreground">
            {data.bio.length}/2000 characters
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="teachingApproach">Teaching Approach</Label>
        <Textarea
          id="teachingApproach"
          value={data.teachingApproach}
          onChange={(e) => onChange("teachingApproach", e.target.value)}
          placeholder="Describe your teaching methodology and how you help students achieve their goals..."
          className="min-h-24"
        />
        <p className="text-xs text-muted-foreground">
          {data.teachingApproach.length}/1000 characters
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="teachingMode">
            Teaching Mode <span className="text-destructive">*</span>
          </Label>
          <Select
            id="teachingMode"
            value={data.teachingMode}
            onChange={(e) => onChange("teachingMode", e.target.value)}
          >
            <option value="ONLINE">Online Only</option>
            <option value="OFFLINE">Offline Only</option>
            <option value="BOTH">Both Online & Offline</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">
            Years of Experience <span className="text-destructive">*</span>
          </Label>
          <Input
            id="yearsOfExperience"
            type="number"
            min="0"
            max="50"
            value={data.yearsOfExperience}
            onChange={(e) =>
              onChange("yearsOfExperience", Number(e.target.value))
            }
          />
          {getFieldError(errors, "yearsOfExperience") && (
            <p className="text-xs text-destructive">
              {getFieldError(errors, "yearsOfExperience")}
            </p>
          )}
        </div>
      </div>

      {(data.teachingMode === "OFFLINE" || data.teachingMode === "BOTH") && (
        <div className="space-y-2">
          <Label htmlFor="offlineLocation">Preferred Teaching Location</Label>
          <Input
            id="offlineLocation"
            value={data.offlineLocation}
            onChange={(e) => onChange("offlineLocation", e.target.value)}
            placeholder="e.g., T Nagar, Chennai"
          />
          <p className="text-xs text-muted-foreground">
            Area or locality where you prefer to teach offline
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Languages</Label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedLanguages.includes(lang)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        {selectedLanguages.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedLanguages.length} language(s) selected
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Teaching Levels</Label>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => toggleLevel(level)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedLevels.includes(level)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        {selectedLevels.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedLevels.length} level(s) selected
          </p>
        )}
      </div>
    </div>
  );
}
