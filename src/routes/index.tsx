import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  GaugeCircle,
  Leaf,
  Lightbulb,
  Users,
  Wand2,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";
import { DAYS, PERIODS } from "@/lib/scheduler";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CognitiSched AI — Cognitive Timetable Scheduler" },
      {
        name: "description",
        content:
          "Generate conflict-free academic timetables with protected cognitive-wellness blocks, constraint scoring and analytics.",
      },
      { property: "og:title", content: "CognitiSched AI — Cognitive Timetable Scheduler" },
      {
        property: "og:description",
        content:
          "Constraint-aware timetable generation with wellness blocks, alternatives and explainable scores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const PIPELINE = [
  "Validate data",
  "Reserve wellness",
  "Hard constraints",
  "Feasibility search",
  "Optimise soft goals",
  "Rank & explain",
];

function Dashboard() {
  const { courses, active, schedules } = useStore();
  const faculty = new Set(courses.map((c) => c.faculty)).size;
  const upcoming = active?.slots.filter((s) => s.day === DAYS[0]).slice(0, 4) ?? [];

  return (
    <AppLayout
      crumb="Overview"
      title="Scheduling Dashboard"
      actions={
        <Link
          to="/generate"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow transition-colors hover:opacity-90"
        >
          <Wand2 className="size-3.5" /> Generate schedule
        </Link>
      }
    >
      <section className="flex min-h-[240px] justify-between gap-6 rounded-2xl bg-sidebar p-7 text-sidebar-foreground">
        <div className="max-w-[670px]">
          <p className="label-caps text-sidebar-muted">Cognitive optimisation engine</p>
          <h2 className="my-2.5 text-2xl leading-tight font-bold md:text-3xl">
            Timetables that respect attention spans, not just room availability.
          </h2>
          <p className="text-sm text-sidebar-muted">
            {courses.length} courses · {faculty} faculty · {schedules.length} ranked alternatives
            generated with wellness blocks reserved before any class is placed.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/timetable"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-xs font-bold text-primary-foreground"
            >
              View timetable <ArrowRight className="size-3.5" />
            </Link>
            <Link
              to="/data"
              className="inline-flex items-center gap-2 rounded-lg border border-sidebar-border px-4 py-3 text-xs font-bold"
            >
              Import data
            </Link>
          </div>
        </div>
        <div className="hidden place-items-center xl:grid">
          <div className="grid size-40 place-items-center rounded-full bg-primary text-4xl font-black shadow-glow">
            {active?.score ?? 0}
          </div>
        </div>
      </section>

      <div className="my-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: CalendarDays, label: "Sessions placed", value: active?.slots.length ?? 0, sub: "this week" },
          { icon: Users, label: "Faculty covered", value: faculty, sub: "no double-booking" },
          { icon: Leaf, label: "Wellness blocks", value: 6, sub: "protected" },
          { icon: GaugeCircle, label: "Best score", value: active?.score ?? 0, sub: "out of 100" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="card-surface flex gap-3 p-4">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <Icon className="size-4" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground">{label}</span>
              <strong className="block text-xl">{value}</strong>
              <small className="block text-[10px] text-muted-foreground">{sub}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="card-surface mb-4 flex flex-wrap items-center gap-2 p-4">
        {PIPELINE.map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-2 rounded-lg border bg-muted px-2.5 py-2 text-[10px] font-bold"
          >
            <span className="grid size-4 place-items-center rounded-full bg-primary text-[8px] text-primary-foreground">
              {i + 1}
            </span>
            {step}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Monday at a glance</h3>
            <Link to="/timetable" className="text-[11px] font-bold text-primary">
              Full week
            </Link>
          </div>
          {upcoming.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No sessions placed yet.
            </p>
          )}
          {upcoming.map((s) => (
            <div key={s.id} className="flex items-center gap-3 border-t py-3 first:border-t-0">
              <span className="w-16 text-[10px] font-extrabold text-primary">
                {PERIODS[s.period]!.label}
              </span>
              <div>
                <b className="text-xs">{s.course.subject}</b>
                <small className="block text-[10px] text-muted-foreground">
                  {s.course.faculty} · {s.room}
                </small>
              </div>
              <span className="ml-auto rounded-full bg-wellness-soft px-2.5 py-1 text-[9px] text-wellness">
                {s.course.batch}
              </span>
            </div>
          ))}
        </div>

        <div className="card-surface p-5">
          <h3 className="mb-3 text-sm font-semibold">Engine insights</h3>
          {(active?.breakdown ?? []).map((b) => (
            <div key={b.label} className="flex gap-3 border-b py-3 last:border-b-0">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <Lightbulb className="size-4" />
              </div>
              <div className="w-full">
                <b className="text-[11px]">{b.label}</b>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <i className="block h-full rounded-full bg-primary" style={{ width: `${b.value}%` }} />
                </div>
              </div>
              <b className="text-[11px] text-primary">{b.value}</b>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
