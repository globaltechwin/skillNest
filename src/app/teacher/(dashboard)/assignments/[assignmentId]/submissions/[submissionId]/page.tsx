import { notFound } from "next/navigation";
import { getSubmissionForGrading } from "../../../actions";
import { GradeSubmissionForm } from "./GradeSubmissionForm";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string; submissionId: string }>;
}) {
  const { assignmentId, submissionId } = await params;

  const data = await getSubmissionForGrading(assignmentId, submissionId);
  if (!data) notFound();

  return (
    <GradeSubmissionForm
      assignment={data.assignment}
      submission={data.submission}
    />
  );
}
