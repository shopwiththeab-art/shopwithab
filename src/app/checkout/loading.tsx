export default function Loading() {
  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="mb-16 md:mb-24">
          <div className="h-3.5 w-20 skeleton rounded mb-4" />
          <div className="h-12 md:h-20 w-72 skeleton rounded mb-3" />
          <div className="h-12 md:h-20 w-48 skeleton rounded" />
        </div>
        <div className="space-y-6">
          <div className="h-4 w-full max-w-lg skeleton rounded" />
          <div className="h-4 w-full max-w-md skeleton rounded" />
        </div>
      </div>
    </div>
  );
}
