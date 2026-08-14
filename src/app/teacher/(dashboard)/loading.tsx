export default function TeacherDashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="h-8 bg-muted rounded w-64 animate-pulse" />
      <div className="h-4 bg-muted rounded w-96 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 border border-border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="size-11 bg-muted rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-7 bg-muted rounded w-12 animate-pulse" />
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
