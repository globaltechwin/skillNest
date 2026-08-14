import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";
import { TeacherListClient } from "./TeacherListClient";
import { getTeachersWithRatings } from "./actions";

export default async function StudentTeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const search = params.search || "";
  const subject = params.subject || "";
  const teachingLevel = params.teachingLevel || "";
  const teachingMode = params.teachingMode || "";
  const location = params.location || "";

  const [result, subjects] = await Promise.all([
    getTeachersWithRatings({
      search,
      subject,
      teachingLevel,
      teachingMode,
      location,
      page,
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  const { teachers, total, totalPages } = result;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Find Tutors
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Browse approved tutors and find the right match for you.
        </p>
      </div>

      <TeacherListClient
        initialTeachers={teachers}
        subjects={subjects}
        initialTotal={total}
        initialPage={page}
        totalPages={totalPages}
        initialFilters={{
          search,
          subject,
          teachingLevel,
          teachingMode,
          location,
        }}
      />
    </div>
  );
}
