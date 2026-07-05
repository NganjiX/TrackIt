import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav, MobileHeader } from './MobileNav';
import { DesktopTopBar } from './DesktopTopBar';
import { useUiStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

/**
 * Main application shell — Stitch bento canvas layout.
 */
export function AppLayout() {
  const { sidebarCollapsed } = useUiStore();

  return (
    <div className="flex min-h-screen bg-[#000000] text-white overflow-x-hidden">
      <Sidebar />
      <MobileNav />

      <div
        className={cn(
          'flex flex-1 flex-col min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64',
        )}
      >
        <MobileHeader />
        <DesktopTopBar compactSidebar={sidebarCollapsed} />
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <main className="p-margin-mobile md:p-margin-desktop pt-unit-lg md:pt-unit-lg max-w-[1400px] w-full bg-[#000000]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
