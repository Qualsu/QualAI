import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPageSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col text-neutral-100">
      <div className="shrink-0 border-b border-neutral-800 p-4">
        <Skeleton className="h-10 w-48" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
          <div className="mr-auto w-[78%]">
            <Skeleton className="mb-2 h-3 w-28" />
            <Skeleton className="h-24 w-full" />
          </div>

          <div className="ml-auto w-[72%]">
            <Skeleton className="mb-2 ml-auto h-3 w-12" />
            <Skeleton className="h-20 w-full" />
          </div>

          <div className="mr-auto w-[66%]">
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-neutral-800 px-4 pb-6 shadow-lg">
        <div className="mx-auto flex max-w-4xl items-end gap-3 pt-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
