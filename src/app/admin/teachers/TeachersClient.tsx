"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Clock, CheckCircle2, XCircle, Pencil, ChevronLeft, ChevronRight, Eye, BookOpen, Award, Clock as ClockIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { updateTeacherStatus, getTeacherApplication, type TeacherRow, type TeacherApplicationData } from "../actions";

type Props = {
  teachers: TeacherRow[];
  total: number;
  page: number;
  totalPages: number;
};

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu",
  FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun",
};

export function TeachersClient({ teachers, total, page, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [editingTeacher, setEditingTeacher] = useState<TeacherRow | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<TeacherRow | null>(null);
  const [applicationData, setApplicationData] = useState<TeacherApplicationData | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const updateParams = useCallback(
    (newSearch: string, newStatus: string, newPage?: number) => {
      const params = new URLSearchParams();
      if (newSearch) params.set("search", newSearch);
      if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
      if (newPage && newPage > 1) params.set("page", String(newPage));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams(search, statusFilter, 1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    updateParams(search, value, 1);
  };

  const loadApplication = async (teacher: TeacherRow) => {
    setViewingTeacher(teacher);
    setLoadingApplication(true);
    setReviewNote("");
    try {
      const data = await getTeacherApplication(teacher.id);
      setApplicationData(data);
    } catch {
      setToast({ type: "error", message: "Failed to load application data." });
    } finally {
      setLoadingApplication(false);
    }
  };

  const handleSaveStatus = async (
    teacherId: string,
    newStatus: "APPROVED" | "PENDING_VERIFICATION" | "REJECTED"
  ) => {
    startTransition(async () => {
      const result = await updateTeacherStatus(teacherId, newStatus, reviewNote || undefined);
      if (result.success) {
        setToast({ type: "success", message: "Status updated successfully" });
        setViewingTeacher(null);
        setEditingTeacher(null);
        setApplicationData(null);
        router.refresh();
      } else {
        setToast({ type: "error", message: result.error || "Failed to update teacher status" });
      }
    });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg text-sm font-medium shadow-lg transition-all ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Teachers</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage teacher verification and applications</p>
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex gap-3 items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search teachers by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="w-44">
            <Select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="APPROVED">Verified</option>
              <option value="PENDING_VERIFICATION">Pending</option>
              <option value="REJECTED">Rejected</option>
            </Select>
          </div>
          <Button type="submit" size="sm">Search</Button>
        </form>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <Search className="size-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">No teachers found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {search || statusFilter !== "ALL" ? "Try adjusting your search or filter criteria." : "Teacher accounts will appear here when users register as teachers."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {teacher.firstName || teacher.lastName ? `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() : "Unnamed Teacher"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{teacher.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(teacher.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={teacher.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => loadApplication(teacher)} disabled={isPending}>
                          <Eye className="size-3.5 mr-1" /> View
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingTeacher(teacher)} disabled={isPending}>
                          <Pencil className="size-3.5 mr-1" /> Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} teachers
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateParams(search, statusFilter, page - 1)}>
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => updateParams(search, statusFilter, page + 1)}>
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Application Review Dialog */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isPending && (setViewingTeacher(null), setApplicationData(null))} />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto ring-1 ring-border">
            {/* Dialog Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Teacher Application</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {viewingTeacher.firstName || viewingTeacher.lastName
                      ? `${viewingTeacher.firstName || ""} ${viewingTeacher.lastName || ""}`.trim()
                      : "Unnamed Teacher"} — {viewingTeacher.email}
                  </p>
                </div>
                <button onClick={() => { setViewingTeacher(null); setApplicationData(null); }} className="text-muted-foreground hover:text-foreground">
                  <XCircle className="size-5" />
                </button>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="px-6 py-4 space-y-6">
              {loadingApplication ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Loading application...</p>
                </div>
              ) : applicationData ? (
                <>
                  {/* Personal Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="size-4 text-muted-foreground" /> Personal Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Phone:</span> {applicationData.profile.phone || "Not set"}</div>
                      <div><span className="text-muted-foreground">Location:</span> {applicationData.profile.location || "Not set"}</div>
                      <div><span className="text-muted-foreground">Gender:</span> {applicationData.profile.gender || "Not set"}</div>
                      <div><span className="text-muted-foreground">Languages:</span> {applicationData.profile.languages || "Not set"}</div>
                      <div><span className="text-muted-foreground">Experience:</span> {applicationData.profile.yearsOfExperience} years</div>
                      <div><span className="text-muted-foreground">Mode:</span> {applicationData.profile.teachingMode}</div>
                      <div><span className="text-muted-foreground">Levels:</span> {applicationData.profile.teachingLevels || "All"}</div>
                    </div>
                    {applicationData.profile.bio && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">{applicationData.profile.bio}</div>
                    )}
                  </div>

                  {/* Subjects */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="size-4 text-muted-foreground" /> Subjects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {applicationData.subjects.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{s.name}</span>
                      ))}
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Award className="size-4 text-muted-foreground" /> Qualifications
                    </h4>
                    {applicationData.qualifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No qualifications provided</p>
                    ) : (
                      <div className="space-y-2">
                        {applicationData.qualifications.map((q, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm">
                            <span className="font-medium text-foreground">{q.title}</span>
                            {q.field && <span className="text-muted-foreground"> — {q.field}</span>}
                            {q.institution && <span className="text-muted-foreground"> at {q.institution}</span>}
                            {q.year ? <span className="text-muted-foreground"> ({q.year})</span> : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <ClockIcon className="size-4 text-muted-foreground" /> Weekly Availability
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {applicationData.availability.map((a, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {DAY_LABELS[a.day] || a.day} {a.startTime} – {a.endTime}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Review Note */}
                  <div>
                    <label className="text-sm font-semibold text-foreground">Review Note (optional)</label>
                    <textarea
                      className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] placeholder:text-muted-foreground"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Add a note for the teacher (shown when rejected)..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button variant="outline" className="flex-1" onClick={() => { setViewingTeacher(null); setApplicationData(null); }} disabled={isPending}>
                      Close
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => handleSaveStatus(viewingTeacher.id, "REJECTED")} disabled={isPending}>
                      {isPending ? "Saving..." : "Reject"}
                    </Button>
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSaveStatus(viewingTeacher.id, "APPROVED")} disabled={isPending}>
                      {isPending ? "Saving..." : "Approve"}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No application data found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog (status only) */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !isPending && setEditingTeacher(null)} />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-6 ring-1 ring-border">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Edit Teacher Status</h3>
              <p className="text-sm text-muted-foreground mt-1">Update verification status</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {editingTeacher.firstName || editingTeacher.lastName
                    ? `${editingTeacher.firstName || ""} ${editingTeacher.lastName || ""}`.trim()
                    : "Unnamed Teacher"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <p className="text-sm text-muted-foreground mt-0.5">{editingTeacher.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Teacher Status</label>
                <Select id="edit-status-select" defaultValue={editingTeacher.status} className="mt-1.5">
                  <option value="PENDING_VERIFICATION">Pending</option>
                  <option value="APPROVED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Review Note (optional)</label>
                <textarea
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] placeholder:text-muted-foreground"
                  defaultValue={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Add a note for the teacher..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingTeacher(null)} disabled={isPending}>Cancel</Button>
              <Button onClick={() => {
                const select = document.getElementById("edit-status-select") as HTMLSelectElement;
                if (select) {
                  handleSaveStatus(editingTeacher.id, select.value as "APPROVED" | "PENDING_VERIFICATION" | "REJECTED");
                }
              }} disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="size-3" /> Verified
      </span>
    );
  }
  if (status === "PENDING_VERIFICATION") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <Clock className="size-3" /> Pending
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <XCircle className="size-3" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>
  );
}
