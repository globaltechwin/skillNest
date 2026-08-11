"use client";

import { useState } from "react";
import { Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTeacherPhone } from "../actions";

type Props = {
  teacherId: string;
};

export function ContactTeacherButton({ teacherId }: Props) {
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContact = async () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getTeacherPhone(teacherId);
      if (result) {
        setPhone(result);
        window.location.href = `tel:${result}`;
      } else {
        setError("Phone number not available.");
      }
    } catch {
      setError("Failed to load contact information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-2">
      <Button onClick={handleContact} disabled={loading} className="gap-2">
        <Phone className="size-4" />
        {loading
          ? "Loading..."
          : phone
            ? `Call ${phone}`
            : "Contact Teacher"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="size-3" />
          Open in phone app
        </a>
      )}
    </div>
  );
}
