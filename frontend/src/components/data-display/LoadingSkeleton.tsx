import { cn } from '@/lib/utils';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

/** Shimmer loading skeleton matching glass card layout. */
export function LoadingSkeleton({ rows = 5, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('glass-card rounded-2xl p-unit-md space-y-4', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-surface-container shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-container rounded w-3/5" />
            <div className="h-3 bg-surface-container-low rounded w-2/5" />
          </div>
          <div className="h-4 bg-surface-container rounded w-16" />
        </div>
      ))}
    </div>
  );
}

/** Full-page loading state for route transitions. */
export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center premium-shadow animate-pulse">
        <MaterialIcon name="account_balance_wallet" className="text-on-secondary-container text-3xl" />
      </div>
      <div className="h-1 w-32 rounded-full bg-surface-container overflow-hidden">
        <div className="h-full w-1/2 bg-secondary animate-pulse rounded-full" />
      </div>
    </div>
  );
}
