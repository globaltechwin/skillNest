"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, User, BookOpen, Award, Clock, Check, ArrowRight, ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { submitTeacherApplication, getExistingApplication, getSubjects, type ApplicationData } from "./actions";

const STEPS = [
  { label: "Basic Info", icon: User, description: "Personal details" },
  { label: "Subjects", icon: BookOpen, description: "What you teach" },
  { label: "Qualifications", icon: Award, description: "Your credentials" },
  { label: "Availability", icon: Clock, description: "Your schedule" },
  { label: "Review", icon: Check, description: "Confirm & submit" },
];

const LANGUAGES = [
  "English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali",
  "Marathi", "Gujarati", "Punjabi", "Urdu", "French", "German", "Spanish",
  "Mandarin", "Japanese", "Korean", "Arabic", "Portuguese", "Russian",
];

const LEVELS = [
  "Primary (1-5)", "Middle School (6-8)", "High School (9-10)",
  "Higher Secondary (11-12)", "Undergraduate", "Postgraduate", "Professional",
];

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABELS: Record<string, string> = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu",
  FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun",
};

export default function TeacherApplyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  const [formData, setFormData] = useState<ApplicationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    location: "",
    languages: [],
    bio: "",
    yearsOfExperience: 0,
    teachingMode: "BOTH",
    teachingLevels: [],
    subjectIds: [],
    qualifications: [{ title: "", field: "", institution: "", year: 0 }],
    availability: [{ day: "MONDAY", startTime: "09:00", endTime: "12:00" }],
  });

  useEffect(() => {
    // Fetch current session and prefill the form
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.active) {
          setFormData((prev) => ({
            ...prev,
            firstName: prev.firstName || data.active.firstName || "",
            lastName: prev.lastName || data.active.lastName || "",
            email: prev.email || data.active.email || "",
          }));
        }
      });

    getSubjects().then(setSubjects);
    getExistingApplication().then((existing) => {
      if (existing) {
        setFormData((prev) => ({
          ...prev,
          ...existing,
        }));
      }
      setLoadingExisting(false);
    });
  }, []);

  if (loadingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const updateField = (field: keyof ApplicationData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const toggleLevel = (level: string) => {
    setFormData((prev) => ({
      ...prev,
      teachingLevels: prev.teachingLevels.includes(level)
        ? prev.teachingLevels.filter((l) => l !== level)
        : [...prev.teachingLevels, level],
    }));
  };

  const toggleSubject = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(id)
        ? prev.subjectIds.filter((s) => s !== id)
        : [...prev.subjectIds, id],
    }));
  };

  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, { title: "", field: "", institution: "", year: 0 }],
    }));
  };

  const removeQualification = (i: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, idx) => idx !== i),
    }));
  };

  const updateQualification = (i: number, field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.map((q, idx) =>
        idx === i ? { ...q, [field]: value } : q
      ),
    }));
  };

  const addAvailability = () => {
    setFormData((prev) => ({
      ...prev,
      availability: [...prev.availability, { day: "MONDAY", startTime: "09:00", endTime: "12:00" }],
    }));
  };

  const removeAvailability = (i: number) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, idx) => idx !== i),
    }));
  };

  const updateAvailability = (i: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.map((a, idx) =>
        idx === i ? { ...a, [field]: value } : a
      ),
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!formData.firstName && !!formData.phone && !!formData.location;
      case 1:
        return formData.subjectIds.length > 0;
      case 3:
        return formData.availability.length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitTeacherApplication(formData);
      if (result.success) {
        setToast({ type: "success", message: "Application submitted!" });
        setTimeout(() => router.push("/teacher/application-status"), 1500);
      } else {
        setToast({ type: "error", message: result.error });
      }
    } catch {
      setToast({ type: "error", message: "An error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => router.push("/")} className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="size-5 text-primary" strokeWidth={1.8} />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">SkillNest</span>
          </button>
          <div className="ml-4 pl-4 border-l border-border">
            <h1 className="text-sm font-semibold text-foreground">Teacher Application</h1>
            <p className="text-xs text-muted-foreground">Fill out the form below to apply</p>
          </div>
          <button onClick={() => router.push("/")} className="ml-auto text-sm text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-10" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary mx-10 transition-all duration-300"
              style={{ width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - 5rem)` }}
            />
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === currentStep;
              const isComplete = i < currentStep;
              return (
                <div key={step.label} className="relative z-10 flex flex-col items-center gap-2 cursor-pointer" onClick={() => { if (i < currentStep) setCurrentStep(i); }}>
                  <div className={`flex size-10 items-center justify-center rounded-full border-2 transition-all ${
                    isComplete
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                  }`}>
                    {isComplete ? <Check className="size-5" /> : <Icon className="size-5" />}
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.label}</p>
                    <p className="text-[10px] text-muted-foreground/60">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6 sm:p-8">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
                <p className="text-sm text-muted-foreground mt-1">Tell us about yourself</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">First Name *</label>
                  <Input className="mt-1.5" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} placeholder="Enter first name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <Input className="mt-1.5" value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} placeholder="Enter last name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input className="mt-1.5 bg-muted" value={formData.email} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Phone *</label>
                  <Input className="mt-1.5" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Gender</label>
                  <Select className="mt-1.5" value={formData.gender} onChange={(e) => updateField("gender", e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">City / Location *</label>
                  <Input className="mt-1.5" value={formData.location} onChange={(e) => updateField("location", e.target.value)} placeholder="e.g. Chennai" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Bio</label>
                <textarea className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] placeholder:text-muted-foreground" value={formData.bio} onChange={(e) => updateField("bio", e.target.value)} placeholder="Tell students about your teaching experience, style, and what makes you unique..." />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Languages</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {LANGUAGES.map((lang) => (
                    <button key={lang} onClick={() => toggleLanguage(lang)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.languages.includes(lang) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}>
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Teaching Details</h2>
                <p className="text-sm text-muted-foreground mt-1">Select your subjects and teaching mode</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Subjects *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {subjects.map((subject) => (
                    <button key={subject.id} onClick={() => toggleSubject(subject.id)} className={`p-3 rounded-lg border text-sm font-medium text-left transition-all ${formData.subjectIds.includes(subject.id) ? "bg-primary/10 border-primary text-primary" : "bg-card border-border hover:border-primary/30"}`}>
                      {formData.subjectIds.includes(subject.id) && <Check className="inline size-3.5 mr-1.5" />}
                      {subject.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Teaching Mode *</label>
                  <Select className="mt-1.5" value={formData.teachingMode} onChange={(e) => updateField("teachingMode", e.target.value)}>
                    <option value="ONLINE">Online Only</option>
                    <option value="OFFLINE">Offline Only</option>
                    <option value="BOTH">Both Online & Offline</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Years of Experience</label>
                  <Input type="number" className="mt-1.5" value={formData.yearsOfExperience} onChange={(e) => updateField("yearsOfExperience", parseInt(e.target.value) || 0)} min="0" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Teaching Levels</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {LEVELS.map((level) => (
                    <button key={level} onClick={() => toggleLevel(level)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.teachingLevels.includes(level) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Qualifications</h2>
                  <p className="text-sm text-muted-foreground mt-1">Add your educational and professional qualifications</p>
                </div>
                <Button variant="outline" size="sm" onClick={addQualification}><Plus className="size-3.5 mr-1.5" /> Add</Button>
              </div>
              {formData.qualifications.map((qual, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Qualification {i + 1}</span>
                    {formData.qualifications.length > 1 && (
                      <button onClick={() => removeQualification(i)} className="text-muted-foreground hover:text-red-600"><Trash2 className="size-4" /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground">Degree / Title *</label>
                      <Input className="mt-1" value={qual.title} onChange={(e) => updateQualification(i, "title", e.target.value)} placeholder="e.g. B.Sc Mathematics" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">Field of Study</label>
                      <Input className="mt-1" value={qual.field} onChange={(e) => updateQualification(i, "field", e.target.value)} placeholder="e.g. Mathematics" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">Institution</label>
                      <Input className="mt-1" value={qual.institution} onChange={(e) => updateQualification(i, "institution", e.target.value)} placeholder="e.g. IIT Madras" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">Year</label>
                      <Input type="number" className="mt-1" value={qual.year || ""} onChange={(e) => updateQualification(i, "year", parseInt(e.target.value) || 0)} placeholder="e.g. 2022" min="1970" max="2030" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Weekly Availability</h2>
                  <p className="text-sm text-muted-foreground mt-1">Add your available time slots</p>
                </div>
                <Button variant="outline" size="sm" onClick={addAvailability}><Plus className="size-3.5 mr-1.5" /> Add Slot</Button>
              </div>
              <div className="space-y-3">
                {formData.availability.map((slot, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                    <Select value={slot.day} onChange={(e) => updateAvailability(i, "day", e.target.value)} className="w-32">
                      {DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                    </Select>
                    <Input type="time" value={slot.startTime} onChange={(e) => updateAvailability(i, "startTime", e.target.value)} className="w-32" />
                    <span className="text-muted-foreground text-sm">to</span>
                    <Input type="time" value={slot.endTime} onChange={(e) => updateAvailability(i, "endTime", e.target.value)} className="w-32" />
                    {formData.availability.length > 1 && (
                      <button onClick={() => removeAvailability(i)} className="text-muted-foreground hover:text-red-600 ml-auto"><Trash2 className="size-4" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Review & Submit</h2>
                <p className="text-sm text-muted-foreground mt-1">Review your application before submitting</p>
              </div>

              {/* Personal Info */}
              <div className="p-4 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Personal Information</h3>
                  <button onClick={() => setCurrentStep(0)} className="text-xs text-primary hover:underline">Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> {formData.firstName} {formData.lastName}</div>
                  <div><span className="text-muted-foreground">Email:</span> {formData.email}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {formData.phone || "Not set"}</div>
                  <div><span className="text-muted-foreground">Location:</span> {formData.location || "Not set"}</div>
                  <div><span className="text-muted-foreground">Languages:</span> {formData.languages.join(", ") || "Not set"}</div>
                </div>
                {formData.bio && <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Bio:</span> {formData.bio}</p>}
              </div>

              {/* Teaching */}
              <div className="p-4 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Teaching Details</h3>
                  <button onClick={() => setCurrentStep(1)} className="text-xs text-primary hover:underline">Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Subjects:</span> {subjects.filter((s) => formData.subjectIds.includes(s.id)).map((s) => s.name).join(", ") || "None"}</div>
                  <div><span className="text-muted-foreground">Mode:</span> {formData.teachingMode}</div>
                  <div><span className="text-muted-foreground">Experience:</span> {formData.yearsOfExperience} years</div>
                  <div><span className="text-muted-foreground">Levels:</span> {formData.teachingLevels.join(", ") || "All"}</div>
                </div>
              </div>

              {/* Qualifications */}
              <div className="p-4 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Qualifications</h3>
                  <button onClick={() => setCurrentStep(2)} className="text-xs text-primary hover:underline">Edit</button>
                </div>
                {formData.qualifications.filter((q) => q.title).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No qualifications added</p>
                ) : (
                  <div className="space-y-2">
                    {formData.qualifications.filter((q) => q.title).map((q, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{q.title}</span>
                        {q.field && <span className="text-muted-foreground"> - {q.field}</span>}
                        {q.institution && <span className="text-muted-foreground"> at {q.institution}</span>}
                        {q.year ? <span className="text-muted-foreground"> ({q.year})</span> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="p-4 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Availability</h3>
                  <button onClick={() => setCurrentStep(3)} className="text-xs text-primary hover:underline">Edit</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.availability.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {DAY_LABELS[a.day]} {a.startTime} - {a.endTime}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
                <p className="font-medium">Important:</p>
                <p>Your application will be reviewed by our team. You cannot teach until your profile is approved.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)} disabled={currentStep === 0}>
              <ArrowLeft className="size-4 mr-1.5" /> Back
            </Button>
            <div className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </div>
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={() => validateStep(currentStep) && setCurrentStep(currentStep + 1)}>
                Next <ArrowRight className="size-4 ml-1.5" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting || !validateStep(0)}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg text-sm font-medium shadow-lg transition-all ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
