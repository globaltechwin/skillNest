export default function MessagesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded w-48 animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border border-border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="size-10 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded w-48 animate-pulse" />
                <div className="h-4 bg-muted rounded w-64 animate-pulse" />
              </div>
              <div className="h-4 bg-muted rounded w-16 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
