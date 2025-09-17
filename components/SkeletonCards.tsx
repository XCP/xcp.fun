export default function SkeletonCards({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="block border-2 border-gray-200 rounded-lg bg-white overflow-hidden animate-pulse"
        >
          <div className="flex flex-col md:flex-row">
            {/* Left section skeleton */}
            <div className="flex gap-4 p-4 md:w-1/2">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-200 rounded-lg" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-2.5 bg-gray-200 rounded-full" />
              </div>
            </div>

            {/* Right section skeleton */}
            <div className="flex items-center border-t md:border-t-0 md:border-l border-gray-200 md:w-1/2 bg-gray-50">
              <div className="flex-1 p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-16 mb-1" />
                    <div className="h-5 bg-gray-300 rounded w-20" />
                  </div>
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-16 mb-1" />
                    <div className="h-5 bg-gray-300 rounded w-20" />
                  </div>
                  <div>
                    <div className="h-3 bg-gray-300 rounded w-16 mb-1" />
                    <div className="h-5 bg-gray-300 rounded w-20" />
                  </div>
                </div>
              </div>
              <div className="flex items-center px-4 border-l border-gray-200">
                <div className="h-10 w-20 bg-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}