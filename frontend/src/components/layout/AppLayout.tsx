import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav, MobileHeader } from './MobileNav';
import { useUiStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

/**
 * Main application shell — Stitch bento canvas layout.
 */
export function AppLayout() {
  const { sidebarCollapsed } = useUiStore();

  return (
    <div className="flex min-h-screen bg-background text-on-surface overflow-x-hidden">
      <Sidebar />
      <MobileNav />

      <div
        className={cn(
          'flex flex-1 flex-col min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64',
        )}
      >
        <MobileHeader />
        <main className="flex-1 p-margin-mobile md:p-margin-desktop max-w-[1400px] w-full custom-scrollbar overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
