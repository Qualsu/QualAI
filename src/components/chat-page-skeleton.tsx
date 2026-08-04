import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPageSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col text-white">
      <div className="shrink-0 border-b border-white/10 px-6 py-4 backdrop-blur-xl bg-white/[0.02]">
        <Skeleton className="h-10 w-52 rounded-xl bg-white/[0.06] border border-white/10" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="mr-auto w-[78%]">
            <Skeleton className="mb-2 h-3 w-24 bg-white/[0.04] rounded" />
            <Skeleton className="h-24 w-full surface-panel rounded-2xl border border-white/10 bg-white/[0.04]" />
          </div>

          <div className="ml-auto w-[72%]">
            <Skeleton className="mb-2 ml-auto h-3 w-12 bg-white/[0.04] rounded" />
            <Skeleton className="h-20 w-full rounded-2xl bg-purple-600/20 border border-purple-400/20" />
          </div>

          <div className="mr-auto w-[66%]">
            <Skeleton className="mb-2 h-3 w-24 bg-white/[0.04] rounded" />
            <Skeleton className="h-16 w-full surface-panel rounded-2xl border border-white/10 bg-white/[0.04]" />
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 sm:px-6 pb-6 pt-2">
        <div className="mx-auto flex max-w-4xl items-end gap-3 surface-panel p-2 rounded-2xl border-white/15 bg-white/[0.04] shadow-2xl">
          <Skeleton className="h-12 flex-1 rounded-xl bg-white/[0.06]" />
          <Skeleton className="h-12 w-12 rounded-xl bg-purple-600/30" />
        </div>
      </div>
    </div>
  );
}
