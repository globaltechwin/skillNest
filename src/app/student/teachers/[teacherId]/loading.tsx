export default function TeacherProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 bg-muted rounded animate-pulse" />

      <div className="border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="size-20 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-7 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-16 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-6 space-y-3">
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-7 w-20 bg-muted rounded-full animate-pulse" />
              <div className="h-7 w-24 bg-muted rounded-full animate-pulse" />
              <div className="h-7 w-16 bg-muted rounded-full animate-pulse" />
            </div>
          </div>
          <div className="border rounded-lg p-6 space-y-3">
            <div className="h-5 w-36 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-6 space-y-3">
          <div className="h-5 w-28 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
