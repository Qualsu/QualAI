import { cn } from "@/lib/utils";
import type { SkeletonProps } from "@/config/types";


export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-neutral-800/90", className)} {...props} />;
}
