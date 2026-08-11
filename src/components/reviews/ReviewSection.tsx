"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Pencil, Plus, Trash2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import { ReviewCard } from "./ReviewCard";
import {
  getTeacherReviews,
  getMyReview,
  createReview,
  updateReview,
  deleteReview,
} from "@/app/student/reviews/actions";
import type { ReviewData, ReviewStats, ReviewWithStudent } from "@/app/student/reviews/actions";

type Props = {
  teacherProfileId: string;
  isStudent: boolean;
};

export default function ReviewSection({ teacherProfileId, isStudent }: Props) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [myReview, setMyReview] = useState<ReviewWithStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewWithStudent | null>(null);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const refetchReviews = useCallback(async () => {
    const [reviewData, myReviewData] = await Promise.all([
      getTeacherReviews(teacherProfileId),
      isStudent ? getMyReview(teacherProfileId) : Promise.resolve(null),
    ]);

    setReviews(reviewData.reviews);
    setStats(reviewData.stats);

    if (myReviewData?.success && myReviewData.review) {
      setMyReview(myReviewData.review as ReviewWithStudent);
    } else {
      setMyReview(null);
    }
  }, [teacherProfileId, isStudent]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [reviewData, myReviewData] = await Promise.all([
          getTeacherReviews(teacherProfileId),
          isStudent ? getMyReview(teacherProfileId) : Promise.resolve(null),
        ]);

        if (cancelled) return;

        setReviews(reviewData.reviews);
        setStats(reviewData.stats);

        if (myReviewData?.success && myReviewData.review) {
          setMyReview(myReviewData.review as ReviewWithStudent);
        } else {
          setMyReview(null);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [teacherProfileId, isStudent]);

  const resetForm = () => {
    setFormRating(0);
    setFormComment("");
    setFormError(null);
    setShowForm(false);
    setEditingReview(null);
  };

  const handleStartEdit = () => {
    if (!myReview) return;
    setEditingReview(myReview);
    setFormRating(myReview.rating);
    setFormComment(myReview.comment || "");
    setShowForm(true);
    setFormError(null);
  };

  const handleStartWrite = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleSubmit = async () => {
    if (formRating === 0) {
      setFormError("Please select a star rating.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const comment = formComment.trim() || undefined;

      if (editingReview) {
        const result = await updateReview(editingReview.id, formRating, comment);
        if (!result.success) {
          setFormError(result.error);
          return;
        }
      } else {
        const result = await createReview(teacherProfileId, formRating, comment);
        if (!result.success) {
          setFormError(result.error);
          return;
        }
      }

      resetForm();
      await refetchReviews();
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!myReview) return;

    setFormLoading(true);
    setDeleteError(null);
    try {
      const result = await deleteReview(myReview.id);
      if (!result.success) {
        setDeleteError(result.error);
        return;
      }
      setShowDeleteConfirm(false);
      setMyReview(null);
      await refetchReviews();
    } catch {
      setDeleteError("Failed to delete review. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading reviews...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
        {isStudent && !myReview && !showForm && (
          <Button onClick={handleStartWrite} size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Summary */}
      {stats.totalReviews > 0 ? (
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          {/* Average Rating */}
          <div className="flex flex-col items-center sm:items-start shrink-0">
            <span className="text-4xl font-bold text-foreground">
              {stats.averageRating.toFixed(1)}
            </span>
            <StarRating rating={Math.round(stats.averageRating)} size="md" />
            <span className="text-xs text-muted-foreground mt-1">
              {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star as keyof typeof stats.distribution];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-3 text-right">{star}</span>
                  <Star
                    className="size-3.5 fill-yellow-400 text-yellow-400 shrink-0"
                  />
                  <div className="flex-1 h-2 rounded-full bg-primary/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">No reviews yet.</p>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mb-6 p-4 rounded-lg border border-border bg-background/50">
          <h3 className="text-sm font-medium text-foreground mb-3">
            {editingReview ? "Edit Review" : "Write a Review"}
          </h3>

          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 block">Rating</Label>
              <StarRating
                rating={formRating}
                size="lg"
                interactive
                onRate={setFormRating}
              />
              {formRating === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Click a star to rate this teacher.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="review-comment" className="mb-1.5 block">
                Comment <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="review-comment"
                value={formComment}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setFormComment(e.target.value);
                  }
                }}
                placeholder="Share your experience with this teacher..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {formComment.length}/1000
              </p>
            </div>

            {formError && (
              <p className="text-xs text-destructive">{formError}</p>
            )}

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSubmit}
                disabled={formLoading || formRating === 0}
                size="sm"
                className="gap-1.5"
              >
                {formLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
                {editingReview ? "Update Review" : "Submit Review"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                disabled={formLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* My Review Edit/Delete */}
      {isStudent && myReview && !showForm && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground font-medium">Your Review</span>
            {!showDeleteConfirm && (
              <>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleStartEdit}
                  aria-label="Edit your review"
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleDeleteClick}
                  aria-label="Delete your review"
                >
                  <Trash2 className="size-3" />
                </Button>
              </>
            )}
          </div>
          <ReviewCard review={myReview} isOwn />
          {showDeleteConfirm && (
            <div className="mt-2 p-3 rounded-lg border border-border bg-background/50">
              <p className="text-sm text-foreground mb-2">Are you sure you want to delete your review?</p>
              {deleteError && (
                <p className="text-xs text-destructive mb-2">{deleteError}</p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDeleteConfirm}
                  disabled={formLoading}
                  size="sm"
                  variant="destructive"
                  className="gap-1.5"
                >
                  {formLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : null}
                  Yes, delete
                </Button>
                <Button
                  onClick={handleDeleteCancel}
                  variant="outline"
                  size="sm"
                  disabled={formLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div>
          {reviews
            .filter((r) => r.id !== myReview?.id)
            .map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
              />
            ))}
        </div>
      ) : (
        !showForm && <p className="text-sm text-muted-foreground">No reviews yet.</p>
      )}
    </Card>
  );
}
