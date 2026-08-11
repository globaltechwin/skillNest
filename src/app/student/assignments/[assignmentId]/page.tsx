import { notFound } from "next/navigation";
import { getStudentAssignment } from "../actions";
import { AssignmentDetailClient } from "./AssignmentDetailClient";

export default async function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;

  const assignment = await getStudentAssignment(assignmentId);
  if (!assignment) notFound();

  return <AssignmentDetailClient assignment={assignment} />;
}
