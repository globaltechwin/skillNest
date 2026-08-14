"use client";

import { useActionState } from "react";
import { useState, useMemo, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { saveTeacherProfile, type TeacherProfileState } from "./actions";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { TeachingInfoStep } from "./steps/TeachingInfoStep";
import { SubjectsStep } from "./steps/SubjectsStep";
import { QualificationsStep } from "./steps/QualificationsStep";
import { AvailabilityStep } from "./steps/AvailabilityStep";
import { ReviewStep } from "./steps/ReviewStep";

const STEPS = [
  "Basic Information",
  "Teaching Details",
  "Subjects",
  "Qualifications",
  "Availability",
  "Review & Submit",
];

interface Subject {
  id: string;
  name: string;
}

interface Qualification {
  title: string;
  institution: string;
  year: number | null;
}

interface AvailabilityDay {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  location: string;
  bio: string;
  teachingApproach: string;
  teachingMode: string;
  offlineLocation: string;
  yearsOfExperience: number;
  languages: string;
  teachingLevels: string;
  subjectIds: string[];
  qualifications: Qualification[];
  availability: AvailabilityDay[];
}

interface TeacherProfileFormProps {
  subjects: Subject[];
  initialData?: Partial<ProfileData>;
  isEditing?: boolean;
  profileImageUrl?: string | null;
  profilePhotoUrl?: string | null;
}

const defaultAvailability: AvailabilityDay[] = [
  { day: "MONDAY", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "TUESDAY", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "WEDNESDAY", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "THURSDAY", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "FRIDAY", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "SATURDAY", enabled: false, startTime: "09:00", endTime: "17:00" },
  { day: "SUNDAY", enabled: false, startTime: "09:00", endTime: "17:00" },
];

export function TeacherProfileForm({
  subjects,
  initialData,
  isEditing = false,
  profileImageUrl,
  profilePhotoUrl,
}: TeacherProfileFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(profilePhotoUrl || null);

  const [formData, setFormData] = useState<ProfileData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    phone: initialData?.phone || "",
    gender: initialData?.gender || "",
    location: initialData?.location || "",
    bio: initialData?.bio || "",
    teachingApproach: initialData?.teachingApproach || "",
    teachingMode: initialData?.teachingMode || "BOTH",
    offlineLocation: initialData?.offlineLocation || "",
    yearsOfExperience: initialData?.yearsOfExperience || 0,
    languages: initialData?.languages || "",
    teachingLevels: initialData?.teachingLevels || "",
    subjectIds: initialData?.subjectIds || [],
    qualifications: initialData?.qualifications || [
      { title: "", institution: "", year: null },
    ],
    availability: initialData?.availability || defaultAvailability,
  });

  const [state, formAction, isPending] = useActionState(
    saveTeacherProfile,
    { success: false, error: null, errors: null } as TeacherProfileState
  );

  const [isTransitioning, startTransition] = useTransition();

  const updateField = useCallback(
    (field: string, value: string | number | string[] | Qualification[] | AvailabilityDay[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const stepValidation = useMemo(() => {
    const errors: string[] = [];

    if (currentStep === 0) {
      if (!formData.firstName.trim()) errors.push("First name is required");
      if (!formData.phone.trim()) errors.push("Phone number is required");
      if (formData.phone && formData.phone.replace(/\D/g, "").length < 10)
        errors.push("Phone number must be at least 10 digits");
      if (!formData.location.trim()) errors.push("Location is required");
    }

    if (currentStep === 1) {
      if (!formData.bio.trim()) errors.push("Bio is required");
      if (formData.bio && formData.bio.length < 50)
        errors.push("Bio must be at least 50 characters");
      if (formData.yearsOfExperience < 0)
        errors.push("Years of experience must be at least 0");
    }

    if (currentStep === 2) {
      if (formData.subjectIds.length === 0)
        errors.push("Select at least one subject");
    }

    if (currentStep === 3) {
      if (
        formData.qualifications.length === 0 ||
        !formData.qualifications.some((q) => q.title.trim())
      )
        errors.push("Add at least one qualification");
    }

    if (currentStep === 4) {
      const enabled = formData.availability.filter((a) => a.enabled);
      if (enabled.length === 0)
        errors.push("Select at least one available day");
    }

    return errors;
  }, [currentStep, formData]);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
    },
    []
  );

  const nextStep = useCallback(() => {
    if (stepValidation.length === 0 && currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, stepValidation.length, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleSubmit = useCallback(() => {
    const form = new FormData();

    form.append("firstName", formData.firstName);
    form.append("lastName", formData.lastName);
    form.append("phone", formData.phone);
    form.append("gender", formData.gender);
    form.append("location", formData.location);
    form.append("bio", formData.bio);
    form.append("teachingApproach", formData.teachingApproach);
    form.append("teachingMode", formData.teachingMode);
    form.append("offlineLocation", formData.offlineLocation);
    form.append("yearsOfExperience", String(formData.yearsOfExperience));
    form.append("languages", formData.languages);
    form.append("teachingLevels", formData.teachingLevels);
    form.append("subjectIds", JSON.stringify(formData.subjectIds));
    form.append("qualifications", JSON.stringify(formData.qualifications));
    form.append("availability", JSON.stringify(formData.availability));

    startTransition(() => {
      formAction(form);
    });
  }, [formData, formAction, startTransition]);

  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-8 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {isEditing ? "Profile Updated!" : "Profile Submitted!"}
            </h2>
            <p className="text-muted-foreground">
              {isEditing
                ? "Your profile changes have been saved successfully."
                : "Your tutor profile is currently under verification. We'll notify you once it has been reviewed."}
            </p>
          </div>
          {!isEditing && (
            <p className="text-sm text-muted-foreground bg-muted rounded-lg p-4">
              You can track your profile status from the tutor dashboard. Once
              approved, your profile will be visible to students.
            </p>
          )}
          <Button
            onClick={() => router.push("/teacher")}
            className="w-full"
            size="lg"
          >
            Go to Tutor Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => router.push("/teacher")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap
                className="size-5 text-primary"
                strokeWidth={1.8}
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              SkillNest
            </span>
          </div>
          <div className="h-6 w-px bg-border" />
          <span className="text-sm font-medium text-muted-foreground">
            {isEditing ? "Edit Profile" : "Tutor Profile Setup"}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {STEPS[currentStep]}
            </span>
          </div>
          <Progress
            value={currentStep + 1}
            max={STEPS.length}
          />
        </div>

        {/* Step indicators */}
        <div className="hidden sm:flex items-center justify-between mb-8">
          {STEPS.map((step, index) => (
            <button
              key={step}
              onClick={() => index < currentStep && goToStep(index)}
              disabled={index > currentStep}
              className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                index === currentStep
                  ? "text-primary"
                  : index < currentStep
                    ? "text-emerald-600 cursor-pointer"
                    : "text-muted-foreground cursor-not-allowed"
              }`}
            >
              <span
                className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                  index === currentStep
                    ? "bg-primary text-primary-foreground"
                    : index < currentStep
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStep ? "✓" : index + 1}
              </span>
              <span className="hidden lg:inline">{step}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <Card className="p-6 sm:p-8">
          {currentStep === 0 && (
            <BasicInfoStep
              data={formData}
              onChange={updateField}
              errors={state.errors}
              profileImageUrl={profileImageUrl}
              profilePhotoUrl={localPhotoUrl}
              onPhotoUploaded={(url) => setLocalPhotoUrl(url)}
            />
          )}
          {currentStep === 1 && (
            <TeachingInfoStep
              data={formData}
              onChange={updateField}
              errors={state.errors}
            />
          )}
          {currentStep === 2 && (
            <SubjectsStep
              subjects={subjects}
              selectedIds={formData.subjectIds}
              onChange={(ids) => updateField("subjectIds", ids)}
              errors={state.errors}
            />
          )}
          {currentStep === 3 && (
            <QualificationsStep
              qualifications={formData.qualifications}
              onChange={(quals) => updateField("qualifications", quals)}
              errors={state.errors}
            />
          )}
          {currentStep === 4 && (
            <AvailabilityStep
              availability={formData.availability}
              onChange={(avail) => updateField("availability", avail)}
              errors={state.errors}
            />
          )}
          {currentStep === 5 && (
            <ReviewStep data={formData} subjects={subjects} isEditing={isEditing} />
          )}
        </Card>

        {/* Validation errors */}
        {stepValidation.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-medium text-destructive mb-2">
              Please fix the following:
            </p>
            <ul className="text-sm text-destructive space-y-1">
              {stepValidation.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Server error */}
        {state.error && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Next Step
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || stepValidation.length > 0}
            >
              {isPending ? "Submitting..." : "Submit Profile"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
