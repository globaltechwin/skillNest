"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Qualification {
  title: string;
  institution: string;
  year: number | null;
}

interface QualificationsStepProps {
  qualifications: Qualification[];
  onChange: (quals: Qualification[]) => void;
  errors?: Record<string, string[]> | null;
}

export function QualificationsStep({
  qualifications,
  onChange,
  errors,
}: QualificationsStepProps) {
  const addQualification = () => {
    if (qualifications.length < 10) {
      onChange([...qualifications, { title: "", institution: "", year: null }]);
    }
  };

  const removeQualification = (index: number) => {
    if (qualifications.length > 1) {
      onChange(qualifications.filter((_, i) => i !== index));
    }
  };

  const updateQualification = (
    index: number,
    field: keyof Qualification,
    value: string | number | null
  ) => {
    const updated = qualifications.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Qualifications
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add your educational qualifications and certifications.
        </p>
      </div>

      <div className="space-y-4">
        {qualifications.map((qual, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-border space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Qualification {index + 1}
              </span>
              {qualifications.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQualification(index)}
                  className="size-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label>
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={qual.title}
                  onChange={(e) =>
                    updateQualification(index, "title", e.target.value)
                  }
                  placeholder="e.g., B.Ed, M.Sc Mathematics"
                />
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={qual.year ?? ""}
                  onChange={(e) =>
                    updateQualification(
                      index,
                      "year",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  placeholder="e.g., 2020"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Institution</Label>
              <Input
                value={qual.institution}
                onChange={(e) =>
                  updateQualification(index, "institution", e.target.value)
                }
                placeholder="e.g., University of Madras"
              />
            </div>
          </div>
        ))}
      </div>

      {qualifications.length < 10 && (
        <Button
          type="button"
          variant="outline"
          onClick={addQualification}
          className="w-full"
        >
          <Plus className="size-4 mr-2" />
          Add Another Qualification
        </Button>
      )}

      {errors?.qualifications && (
        <p className="text-xs text-destructive">{errors.qualifications[0]}</p>
      )}
    </div>
  );
}
