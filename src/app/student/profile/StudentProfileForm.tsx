"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { updateStudentProfile } from "./actions";

type Props = {
  firstName: string;
  lastName: string;
  email: string;
};

export function StudentProfileForm({ firstName, lastName, email }: Props) {
  const [formFirstName, setFormFirstName] = useState(firstName);
  const [formLastName, setFormLastName] = useState(lastName);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const result = await updateStudentProfile({
      firstName: formFirstName,
      lastName: formLastName,
    });

    if (result.success) {
      setSaved(true);
      router.refresh();
    } else {
      setError(result.error || "Failed to update profile.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle className="size-4" />
          Profile updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            First Name
          </label>
          <input
            type="text"
            value={formFirstName}
            onChange={(e) => setFormFirstName(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Last Name
          </label>
          <input
            type="text"
            value={formLastName}
            onChange={(e) => setFormLastName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Role
        </label>
        <input
          type="text"
          value="Student"
          disabled
          className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !formFirstName.trim()}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        Save Changes
      </button>
    </form>
  );
}
