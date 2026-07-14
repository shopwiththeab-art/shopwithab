export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header skeleton */}
        <div className="h-4 w-32 skeleton rounded mb-4" />
        <div className="h-10 w-64 skeleton rounded mb-12" />

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] skeleton rounded" style={{ animationDelay: `${i * 60}ms` }} />
              <div className="h-3.5 w-3/4 skeleton rounded" style={{ animationDelay: `${i * 60 + 100}ms` }} />
              <div className="h-3 w-1/3 skeleton rounded" style={{ animationDelay: `${i * 60 + 160}ms` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
