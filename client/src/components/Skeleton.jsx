// Skeleton primitives
export function SkeletonBox({ className = '' }) {
  return <div className={`shimmer rounded-xl ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <SkeletonBox className="h-4 w-1/3" />
      <SkeletonBox className="h-8 w-2/3" />
      <SkeletonBox className="h-3 w-full" />
      <SkeletonBox className="h-3 w-4/5" />
    </div>
  )
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
          <SkeletonBox className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-3 w-1/2" />
            <SkeletonBox className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <SkeletonBox className="h-4 w-1/4" />
      <SkeletonBox className="h-48 w-full" />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-purple-400 text-sm">Loading…</p>
      </div>
    </div>
  )
}
