import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';

// Routes that should not show sidebar
const NO_SIDEBAR_ROUTES = [
  '/room/', '/game/', '/games/', '/ranked/battle', '/ranked/search'
];

// Routes that show full-width content (no sidebar, no navbar sometimes)
const GAME_FULL_ROUTES = ['/game/', '/games/'];

function shouldHideSidebar(path: string): boolean {
  return NO_SIDEBAR_ROUTES.some((r) => path.startsWith(r));
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isGuest } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const hideSidebar = shouldHideSidebar(location.pathname);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <NavBar
        onMenuToggle={() => {
          if (isMobile) setSidebarOpen(!sidebarOpen);
          else setSidebarCollapsed(!sidebarCollapsed);
        }}
        menuOpen={isMobile ? sidebarOpen : !sidebarCollapsed}
      />

      {/* Guest banner */}
      {isGuest && (
        <div className="fixed top-14 left-0 right-0 z-30 flex items-center justify-center gap-3 px-4 py-1.5 text-xs"
          style={{ background: 'oklch(0.56 0.28 292 / 0.12)', borderBottom: '1px solid oklch(0.56 0.28 292 / 0.25)' }}>
          <span className="text-muted-foreground">👤 You're browsing as a guest — some features are disabled.</span>
          <button
            onClick={() => navigate('/auth?mode=register')}
            className="font-semibold text-primary hover:underline"
          >
            Create a free account →
          </button>
        </div>
      )}

      <div className={cn("flex min-h-screen", isGuest ? "pt-[calc(3.5rem+2rem)]" : "pt-14")}>
        {/* Sidebar */}
        {!hideSidebar && (
          <>
            {/* Desktop sidebar */}
            {!isMobile && (
              <div
                className={cn(
                  "fixed top-14 bottom-0 z-30 transition-all duration-200",
                  sidebarCollapsed ? "w-[60px]" : "w-[220px]"
                )}
              >
                <Sidebar collapsed={sidebarCollapsed} />
              </div>
            )}

            {/* Mobile sidebar overlay */}
            {isMobile && sidebarOpen && (
              <>
                <div
                  className="fixed inset-0 z-30 bg-black/50"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="fixed top-14 left-0 bottom-0 z-40 w-[220px]">
                  <Sidebar collapsed={false} />
                </div>
              </>
            )}
          </>
        )}

        {/* Main content */}
        <main
          className={cn(
            "flex-1 min-h-full transition-all duration-200",
            !hideSidebar && !isMobile && (sidebarCollapsed ? "ml-[60px]" : "ml-[220px]"),
            isMobile && "pb-16"
          )}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && <MobileNav />}
    </div>
  );
}
