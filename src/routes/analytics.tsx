import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";
import { DAYS, PERIODS } from "@/lib/scheduler";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Scheduling Analytics — CognitiSched AI" },
      {
        name: "description",
        content:
          "Faculty load, daily distribution and room utilisation analytics for the generated timetable.",
      },
      { property: "og:title", content: "Scheduling Analytics — CognitiSched AI" },
      {
        property: "og:description",
        content: "Faculty load, daily distribution and room utilisation analytics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { active } = useStore();
  const slots = active?.slots ?? [];

  const byFaculty = Object.entries(
    slots.reduce<Record<string, number>>((acc, s) => {
      acc[s.course.faculty] = (acc[s.course.faculty] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const byDay = DAYS.map((d) => [d, slots.filter((s) => s.day === d).length] as const);
  const byRoom = Object.entries(
    slots.reduce<Record<string, number>>((acc, s) => {
      acc[s.room] = (acc[s.room] ?? 0) + 1;
      return acc;
    }, {}),
  );
  const max = Math.max(1, ...byFaculty.map(([, v]) => v), ...byDay.map(([, v]) => v));
  const capacity = DAYS.length * PERIODS.length;

  const Bars = ({ rows }: { rows: (readonly [string, number])[] }) => (
    <div className="grid gap-3.5">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[110px_1fr_40px] items-center gap-2 text-[10px]">
          <span className="truncate">{label}</span>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <i className="block h-full rounded-full bg-primary" style={{ width: `${(value / max) * 100}%` }} />
          </div>
          <b className="text-right">{value}h</b>
        </div>
      ))}
    </div>
  );

  return (
    <AppLayout crumb="Insights" title="Analytics">
      <div className="card-surface mb-4 grid grid-cols-2 gap-2.5 p-5 lg:grid-cols-4">
        {[
          ["Quality score", `${active?.score ?? 0}`],
          ["Sessions placed", `${slots.length}`],
          ["Slot utilisation", `${Math.round((slots.length / capacity) * 100)}%`],
          ["Wellness blocks", "6"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-muted p-3.5">
            <b className="block text-xl text-primary">{value}</b>
            <span className="text-[9px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="mb-4 text-sm font-semibold">Faculty teaching load</h3>
          <Bars rows={byFaculty} />
        </div>
        <div className="card-surface p-5">
          <h3 className="mb-4 text-sm font-semibold">Sessions per day</h3>
          <Bars rows={byDay} />
        </div>
        <div className="card-surface p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">Room utilisation</h3>
          <Bars rows={byRoom.map(([k, v]) => [k, v] as const)} />
        </div>
      </div>
    </AppLayout>
  );
}
