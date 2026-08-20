import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpenCheck,
  Bookmark,
  CalendarRange,
  HelpCircle,
  LayoutDashboard,
  Mail,
  Menu,
  MessagesSquare,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";

const workspaceNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email", icon: Mail },
  { to: "/meetings", label: "Meetings", icon: BookOpenCheck },
  { to: "/planner", label: "Task Planner", icon: CalendarRange },
  { to: "/research", label: "Research Hub", icon: Sparkles },
  { to: "/assistant", label: "AI Assistant", icon: MessagesSquare },
] as const;

const otherNav = [
  { to: "/saved", label: "Saved Work", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help", icon: HelpCircle },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const item = (
    to: string,
    label: string,
    Icon: typeof LayoutDashboard,
  ) => {
    const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
    return (
      <Link
        key={to}
        to={to}
        onClick={onNavigate}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--color-sidebar-primary)]"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0 transition-colors",
            active ? "text-sidebar-primary" : "text-sidebar-foreground/55",
          )}
        />
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      <div>
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">
          Workspace
        </p>
        <div className="space-y-1">
          {workspaceNav.map((n) => item(n.to, n.label, n.icon))}
        </div>
      </div>
      <div>
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/45">
          Other
        </p>
        <div className="space-y-1">
          {otherNav.map((n) => item(n.to, n.label, n.icon))}
        </div>
      </div>
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 px-5 py-5">
      <span className="grid size-9 place-items-center rounded-xl gradient-growth text-growth-foreground">
        <Sparkles className="size-4.5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-semibold text-sidebar-accent-foreground">
          WorkWise AI
        </span>
        <span className="block text-[11px] text-sidebar-foreground/55">
          Work smarter. Get more done.
        </span>
      </span>
    </Link>
  );
}

function UserChip() {
  const { profile } = useWorkspace();
  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <Link
      to="/settings"
      className="m-3 flex items-center gap-3 rounded-xl bg-sidebar-accent/60 px-3 py-3 transition-colors hover:bg-sidebar-accent"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
        {initials}
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-sm font-medium text-sidebar-accent-foreground">
          {profile.name}
        </span>
        <span className="block truncate text-[11px] text-sidebar-foreground/55">
          {profile.role}
        </span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar lg:flex">
        <Brand />
        <NavList />
        <UserChip />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg gradient-growth text-growth-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-sm font-semibold">WorkWise AI</span>
        </Link>
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className="grid size-9 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary"
        >
          <Menu className="size-4" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[17rem] flex-col bg-sidebar shadow-2xl rise">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent"
              >
                <X className="size-4" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <UserChip />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
