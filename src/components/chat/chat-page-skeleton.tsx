import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPageSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col text-white">
      <header className="hidden md:flex shrink-0 border-b border-white/10 px-4 sm:px-6 py-3 items-center backdrop-blur-xl bg-[#17191c]/80 z-20">
        <Skeleton className="h-8 sm:h-10 w-44 sm:w-52 rounded-xl bg-white/[0.06] border border-white/10" />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="mr-auto w-full max-w-3xl sm:max-w-4xl space-y-2.5">
            <Skeleton className="h-4 w-[90%] bg-white/[0.07] rounded-md" />
            <Skeleton className="h-4 w-[75%] bg-white/[0.07] rounded-md" />
            <Skeleton className="h-4 w-[50%] bg-white/[0.07] rounded-md" />
          </div>

          <div className="ml-auto max-w-[85%] sm:max-w-[75%]">
            <Skeleton className="h-10 w-48 sm:w-64 rounded-2xl sm:rounded-[22px] bg-[#1d3d75]/80" />
          </div>

          <div className="mr-auto w-full max-w-3xl sm:max-w-4xl space-y-2.5">
            <Skeleton className="h-4 w-[85%] bg-white/[0.07] rounded-md" />
            <Skeleton className="h-4 w-[60%] bg-white/[0.07] rounded-md" />
          </div>
        </div>
      </div>

      <footer className="shrink-0 px-4 sm:px-6 pb-6 pt-2 z-20">
        <div className="max-w-4xl mx-auto">
          <div className="surface-panel rounded-2xl sm:rounded-3xl border-white/15 bg-[#1b1e22]/85 backdrop-blur-2xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3">
            <Skeleton className="rounded-full h-10 w-10 sm:h-11 sm:w-11 bg-white/[0.06] shrink-0" />
            <Skeleton className="h-4 w-32 sm:w-44 bg-white/[0.05] rounded-md mx-2 flex-1" />
            <Skeleton className="rounded-full h-10 w-10 sm:h-11 sm:w-11 bg-[#76a4ff]/40 shrink-0" />
          </div>
          <div className="mt-2.5 text-[11px] text-white/35 text-center">
            Ответы Q.AI и QualAI могут быть не точными. Рекомендуем проверять информацию
          </div>
        </div>
      </footer>
    </div>
  );
}
