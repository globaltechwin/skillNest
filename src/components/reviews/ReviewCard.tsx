"use client";

import { Edit, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import type { ReviewWithStudent } from "@/app/student/reviews/actions";

type ReviewCardProps = {
  review: ReviewWithStudent;
  isOwn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

function getRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months} month${months !== 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  return "just now";
}

export function ReviewCard({ review, isOwn = false, onEdit, onDelete }: ReviewCardProps) {
  const firstName = review.studentFirstName || "Anonymous";
  const lastName = review.studentLastName || "";
  const lastInitial = lastName ? `${lastName[0]}.` : "";
  const displayName = `${firstName} ${lastInitial}`.trim();

  return (
    <div className="py-4 border-b border-border last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="size-3.5 text-primary" />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {getRelativeDate(review.createdAt)}
              </span>
            </div>
          </div>
          <StarRating rating={review.rating} size="sm" />
          {review.comment && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
        {isOwn && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              aria-label="Edit review"
            >
              <Edit className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              aria-label="Delete review"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
