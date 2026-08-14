"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, Loader2, X, Check } from "lucide-react";
import {
  getCourseLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from "./actions";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  order: number;
  duration: string | null;
};

type Props = {
  courseId: string;
  initialLessons: Lesson[];
};

export function LessonManager({ courseId, initialLessons }: Props) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    duration: "",
  });

  const resetForm = () => {
    setForm({ title: "", description: "", content: "", duration: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    const result = await createLesson(courseId, {
      title: form.title,
      description: form.description || undefined,
      content: form.content || undefined,
      duration: form.duration || undefined,
    });
    if (result.success && result.lessonId) {
      setLessons([
        ...lessons,
        {
          id: result.lessonId,
          title: form.title.trim(),
          description: form.description.trim() || null,
          content: form.content.trim() || null,
          order: lessons.length + 1,
          duration: form.duration.trim() || null,
        },
      ]);
      resetForm();
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editingId || !form.title.trim()) return;
    setLoading(true);
    const result = await updateLesson(editingId, {
      title: form.title,
      description: form.description || undefined,
      content: form.content || undefined,
      duration: form.duration || undefined,
    });
    if (result.success) {
      setLessons(
        lessons.map((l) =>
          l.id === editingId
            ? {
                ...l,
                title: form.title.trim(),
                description: form.description.trim() || null,
                content: form.content.trim() || null,
                duration: form.duration.trim() || null,
              }
            : l
        )
      );
      resetForm();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    setLoading(true);
    const result = await deleteLesson(id);
    if (result.success) {
      setLessons(lessons.filter((l) => l.id !== id));
    }
    setLoading(false);
  };

  const startEdit = (lesson: Lesson) => {
    setForm({
      title: lesson.title,
      description: lesson.description || "",
      content: lesson.content || "",
      duration: lesson.duration || "",
    });
    setEditingId(lesson.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          Lessons ({lessons.length})
        </h3>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="size-4" />
          Add Lesson
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">
              {editingId ? "Edit Lesson" : "New Lesson"}
            </h4>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Lesson title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <textarea
            placeholder="Brief description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <textarea
            placeholder="Lesson content (optional)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <input
            type="text"
            placeholder="Duration (e.g., 30 min)"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex gap-2">
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              disabled={loading || !form.title.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No lessons yet. Add lessons to help students learn step by step.
        </p>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-background hover:border-border transition-colors"
            >
              <GripVertical className="size-4 text-muted-foreground shrink-0" />
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{lesson.title}</p>
                {lesson.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {lesson.description}
                  </p>
                )}
              </div>
              {lesson.duration && (
                <span className="text-xs text-muted-foreground shrink-0">{lesson.duration}</span>
              )}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startEdit(lesson)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(lesson.id)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
