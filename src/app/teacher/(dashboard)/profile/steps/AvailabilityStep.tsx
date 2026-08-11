"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AvailabilityDay {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface AvailabilityStepProps {
  availability: AvailabilityDay[];
  onChange: (avail: AvailabilityDay[]) => void;
  errors?: Record<string, string[]> | null;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function AvailabilityStep({
  availability,
  onChange,
  errors,
}: AvailabilityStepProps) {
  const toggleDay = (index: number) => {
    const updated = availability.map((d, i) =>
      i === index ? { ...d, enabled: !d.enabled } : d
    );
    onChange(updated);
  };

  const updateTime = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const updated = availability.map((d, i) =>
      i === index ? { ...d, [field]: value } : d
    );
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Availability
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set your available days and time slots for teaching.
        </p>
      </div>

      <div className="space-y-3">
        {availability.map((daySlot, index) => (
          <div
            key={daySlot.day}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border transition-colors ${
              daySlot.enabled
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
          >
            <div className="flex items-center gap-3 sm:w-40">
              <Checkbox
                checked={daySlot.enabled}
                onCheckedChange={() => toggleDay(index)}
              />
              <Label className="font-medium cursor-pointer">
                {DAY_LABELS[daySlot.day]}
              </Label>
            </div>

            {daySlot.enabled && (
              <div className="flex items-center gap-3 flex-1">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Start Time
                  </Label>
                  <Input
                    type="time"
                    value={daySlot.startTime}
                    onChange={(e) =>
                      updateTime(index, "startTime", e.target.value)
                    }
                    className="w-32"
                  />
                </div>
                <span className="text-muted-foreground pt-5">to</span>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    End Time
                  </Label>
                  <Input
                    type="time"
                    value={daySlot.endTime}
                    onChange={(e) =>
                      updateTime(index, "endTime", e.target.value)
                    }
                    className="w-32"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {errors?.availability && (
        <p className="text-xs text-destructive">{errors.availability[0]}</p>
      )}
    </div>
  );
}
