import { Card } from "@/components/ui/card";
import { getAdminReviews } from "@/app/student/reviews/actions";
import { ReviewsClient } from "./ReviewsClient";
import Link from "next/link";
import { Star } from "lucide-react";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; rating?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const rating = sp.rating && sp.rating !== "ALL" ? Number(sp.rating) : undefined;
  const result = await getAdminReviews(sp.search, rating, page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review Management</h1>
        <p className="text-muted-foreground mt-1">
          View and moderate student reviews
        </p>
      </div>

      <ReviewsClient search={sp.search} rating={sp.rating} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Student
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Teacher
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Rating
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Comment
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No reviews found
                  </td>
                </tr>
              ) : (
                result.data.map((review) => (
                  <tr
                    key={review.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-foreground">
                      {review.studentName}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {review.teacherName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`size-3.5 ${
                              s <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {review.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {review.comment || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <form
                        action={async () => {
                          "use server";
                          const { deleteAdminReview } = await import(
                            "@/app/student/reviews/actions"
                          );
                          await deleteAdminReview(review.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-sm text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {result.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(result.page - 1) * result.pageSize + 1}–
            {Math.min(result.page * result.pageSize, result.total)} of{" "}
            {result.total}
          </p>
          <div className="flex gap-2">
            {result.page > 1 && (
              <Link
                href={`/admin/reviews?page=${result.page - 1}${sp.search ? `&search=${sp.search}` : ""}${sp.rating && sp.rating !== "ALL" ? `&rating=${sp.rating}` : ""}`}
                className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted"
              >
                Previous
              </Link>
            )}
            {result.page < result.totalPages && (
              <Link
                href={`/admin/reviews?page=${result.page + 1}${sp.search ? `&search=${sp.search}` : ""}${sp.rating && sp.rating !== "ALL" ? `&rating=${sp.rating}` : ""}`}
                className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
