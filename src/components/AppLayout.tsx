import { Link, useRouterState } from "@tanstack/react-router";
import {
  BrainCircuit,
  CalendarDays,
  ChevronRight,
  Database,
  LayoutDashboard,
  Search,
  Sparkles,
  Wand2,
  BarChart3,
} from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/data", label: "Data & Courses", icon: Database },
  { to: "/generate", label: "Generate", icon: Wand2 },
  { to: "/timetable", label: "Timetable", icon: CalendarDays },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppLayout({
  crumb,
  title,
  actions,
  children,
}: {
  crumb: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { role, setRole } = useStore();

  return (
    <div className="flex min-h-screen">
      <aside className="no-print fixed inset-y-0 left-0 flex w-[72px] flex-col bg-sidebar px-3 py-5 text-sidebar-foreground lg:w-[245px]">
        <div className="flex items-center gap-3 px-2 pb-6">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <BrainCircuit className="size-5" />
          </div>
          <div className="hidden lg:block">
            <b className="block text-[15px] font-bold">CognitiSched AI</b>
            <span className="text-[10px] text-sidebar-muted">Cognitive timetabling</span>
          </div>
        </div>

        <div className="mb-4 hidden items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-hover p-2.5 lg:flex">
          <div className="w-full">
            <small className="block text-[10px] text-sidebar-muted">Signed in as</small>
            <select
              aria-label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-transparent text-[13px] font-bold text-sidebar-foreground outline-none"
            >
              {["Administrator", "Faculty", "Student"].map((r) => (
                <option key={r} className="text-foreground">
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <nav className="grid gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = path === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-colors ${
                  active
                    ? "bg-sidebar-hover text-sidebar-foreground"
                    : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="hidden lg:inline">{label}</span>
                {active && <ChevronRight className="ml-auto hidden size-3.5 opacity-40 lg:block" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden items-center gap-2 px-3 py-3 text-[11px] text-sidebar-muted lg:flex">
          Solver online
          <span className="ml-auto size-2 rounded-full bg-accent" />
        </div>
      </aside>

      <main className="ml-[72px] w-[calc(100%-72px)] lg:ml-[245px] lg:w-[calc(100%-245px)]">
        <header className="no-print flex h-[88px] items-center justify-between border-b bg-card px-5 md:px-8">
          <div>
            <p className="label-caps">{crumb}</p>
            <h1 className="mt-0.5 text-xl font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden h-9 w-[220px] items-center gap-2 rounded-lg border bg-muted px-3 text-muted-foreground xl:flex">
              <Search className="size-3.5" />
              <input
                aria-label="Search"
                placeholder="Search courses, faculty…"
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
            {actions}
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] px-5 py-6 md:px-8">{children}</div>
      </main>
    </div>
  );
}
