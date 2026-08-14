export default function ScheduleLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded w-48 animate-pulse" />
      <div className="h-4 bg-muted rounded w-64 animate-pulse" />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i}>
            <div className="h-5 bg-muted rounded w-32 mb-3 animate-pulse" />
            <div className="space-y-2">
              {[1, 2].map((j) => (
                <div key={j} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-5 bg-muted rounded w-48 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                    </div>
                    <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
