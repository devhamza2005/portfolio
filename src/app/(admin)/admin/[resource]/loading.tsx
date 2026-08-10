import { Skeleton } from "@/components/ui/skeleton";

/** État de chargement de la liste — même gabarit que le tableau réel (§21). */
export default function ResourceListLoading() {
  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-11 w-28" />
      </div>

      <Skeleton className="mb-4 h-11 w-full max-w-sm" />

      <div className="border-border overflow-hidden rounded-[var(--radius-lg)] border">
        <div className="border-border bg-elevated/40 border-b px-4 py-3">
          <Skeleton className="h-3 w-32" />
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="border-border flex items-center gap-4 border-b px-4 py-4 last:border-0">
            <Skeleton className="size-9 shrink-0 rounded-[var(--radius-sm)]" />
            <Skeleton className="h-4 flex-1 max-w-64" />
            <Skeleton className="hidden h-5 w-20 sm:block" />
            <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </>
  );
}
