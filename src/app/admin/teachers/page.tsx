import { getTeachers } from "../actions";
import { TeachersClient } from "./TeachersClient";

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search =
    typeof params.search === "string" ? params.search : undefined;
  const status =
    typeof params.status === "string" ? params.status : undefined;
  const page =
    typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10) || 1) : 1;

  const result = await getTeachers(search, status, page);

  return (
    <TeachersClient
      teachers={result.data}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
    />
  );
}
