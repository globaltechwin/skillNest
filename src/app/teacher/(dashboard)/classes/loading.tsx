export default function ClassesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded w-48 animate-pulse" />
      <div className="h-4 bg-muted rounded w-64 animate-pulse" />
      <div className="border border-border rounded-lg overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-border last:border-0">
            <div className="h-5 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-5 bg-muted rounded w-1/6 animate-pulse" />
            <div className="h-5 bg-muted rounded w-1/6 animate-pulse" />
            <div className="h-5 bg-muted rounded w-1/6 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
