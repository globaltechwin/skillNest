import { getStudents } from "../actions";
import { StudentsClient } from "./StudentsClient";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search =
    typeof params.search === "string" ? params.search : undefined;
  const page =
    typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10) || 1) : 1;

  const result = await getStudents(search, page);

  return (
    <StudentsClient
      students={result.data}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
    />
  );
}
