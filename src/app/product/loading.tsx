export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 pt-8">
          {/* Image skeleton */}
          <div className="aspect-[3/4] skeleton rounded" />
          {/* Details skeleton */}
          <div className="space-y-5 pt-4">
            <div className="h-3 w-16 skeleton rounded" />
            <div className="h-8 w-3/4 skeleton rounded" />
            <div className="h-5 w-1/4 skeleton rounded" />
            <div className="space-y-2 pt-4">
              <div className="h-3 w-full skeleton rounded" />
              <div className="h-3 w-5/6 skeleton rounded" />
              <div className="h-3 w-4/6 skeleton rounded" />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-4">
              {[1,2,3].map(i => <div key={i} className="h-10 skeleton rounded" />)}
            </div>
            <div className="h-14 skeleton rounded mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
