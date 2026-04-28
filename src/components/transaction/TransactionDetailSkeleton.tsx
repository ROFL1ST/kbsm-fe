export default function TransactionDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary */}
      <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8 space-y-4">
        <div className="h-4 w-24 rounded-full bg-muted" />
        <div className="h-10 w-64 rounded-full bg-muted" />
        <div className="h-4 w-40 rounded-full bg-muted" />
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 rounded-full bg-muted" />
              <div className="h-4 w-24 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8">
        <div className="h-7 w-48 rounded-full bg-muted mb-8" />
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-1 space-y-2">
              <div className="mx-auto h-10 w-10 rounded-full bg-muted" />
              <div className="mx-auto h-3 w-16 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Products + Shipping */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8 space-y-4">
            <div className="h-7 w-32 rounded-full bg-muted" />
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-20 w-20 rounded-2xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded-full bg-muted" />
                  <div className="h-3 w-1/2 rounded-full bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8 space-y-3">
          <div className="h-7 w-48 rounded-full bg-muted" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 w-full rounded-full bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
