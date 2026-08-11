import { getAssignments } from "../actions";
import { AssignmentsClient } from "./AssignmentsClient";

export default async function AdminAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search =
    typeof params.search === "string" ? params.search : undefined;
  const status =
    typeof params.status === "string" ? params.status : undefined;
  const page =
    typeof params.page === "string"
      ? Math.max(1, parseInt(params.page, 10) || 1)
      : 1;

  const result = await getAssignments(search, status, page);

  return (
    <AssignmentsClient
      assignments={result.data}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
    />
  );
}
