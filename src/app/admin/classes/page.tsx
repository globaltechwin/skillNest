import { getClasses } from "../actions";
import { ClassesClient } from "./ClassesClient";

export default async function AdminClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; filter?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const filter = typeof sp.filter === "string" ? sp.filter : undefined;
  const page =
    typeof sp.page === "string"
      ? Math.max(1, parseInt(sp.page, 10) || 1)
      : 1;

  const result = await getClasses(search, filter, page);

  return (
    <ClassesClient
      classes={result.data}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
    />
  );
}
