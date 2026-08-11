"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type StarRatingProps = {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
};

const sizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRate,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  const displayRating = interactive && hoveredRating > 0 ? hoveredRating : selectedRating;

  const handleClick = (star: number) => {
    if (!interactive || !onRate) return;
    setSelectedRating(star);
    onRate(star);
  };

  const handleMouseEnter = (star: number) => {
    if (!interactive) return;
    setHoveredRating(star);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoveredRating(0);
  };

  return (
    <div className="inline-flex items-center gap-0.5" role="radiogroup" aria-label="Rating">
      {Array.from({ length: maxRating }, (_, i) => {
        const star = i + 1;
        const filled = star <= displayRating;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            className={`inline-flex items-center justify-center shrink-0 rounded-sm transition-colors ${
              interactive
                ? "cursor-pointer hover:scale-110"
                : "cursor-default"
            }`}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            aria-pressed={star <= rating}
          >
            <Star
              className={`${sizeClasses[size]} ${
                filled ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
