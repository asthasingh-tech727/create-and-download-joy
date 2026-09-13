import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Sparkles, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/generate")({
  head: () => ({
    meta: [
      { title: "Generate Schedule — CognitiSched AI" },
      {
        name: "description",
        content:
          "Run the constraint solver, compare ranked timetable alternatives and inspect explainable scores.",
      },
      { property: "og:title", content: "Generate Schedule — CognitiSched AI" },
      {
        property: "og:description",
        content: "Run the solver and compare ranked timetable alternatives.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GeneratePage,
});

function GeneratePage() {
  const { config, setConfig, schedules, active, setActiveId, regenerate, constraints } = useStore();

  const toggles = [
    ["protectWellness", "Protect wellness blocks", "Never place a class in a reserved recovery slot"],
    ["spreadSubjects", "Spread subjects", "At most one session of a subject per day per batch"],
    ["morningHeavy", "Front-load mornings", "Prefer high-focus morning periods"],
  ] as const;

  return (
    <AppLayout
      crumb="Solver"
      title="Generate Schedule"
      actions={
        <button
          onClick={() => {
            regenerate();
            toast.success("Solver finished — alternatives re-ranked");
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
        >
          <Sparkles className="size-3.5" /> Run solver
        </button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="mb-2 text-sm font-semibold">Optimisation settings</h3>
          {toggles.map(([key, label, sub]) => (
            <div key={key} className="flex items-center justify-between border-b py-3 last:border-b-0">
              <div>
                <b className="block text-[11px]">{label}</b>
                <small className="text-[9px] text-muted-foreground">{sub}</small>
              </div>
              <button
                aria-label={label}
                onClick={() => setConfig({ ...config, [key]: !config[key] })}
                className={`h-5 w-9 rounded-full p-0.5 transition-colors ${config[key] ? "bg-primary" : "bg-muted"}`}
              >
                <i className={`block size-4 rounded-full bg-card transition-transform ${config[key] ? "translate-x-4" : ""}`} />
              </button>
            </div>
          ))}

          <h3 className="mt-5 mb-2 text-sm font-semibold">Active constraints</h3>
          <div className="flex flex-wrap gap-2">
            {constraints.map((c) => (
              <span key={c} className="rounded-full border bg-muted px-2.5 py-1.5 text-[9px]">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="card-surface p-5">
          <h3 className="mb-2 text-sm font-semibold">Score explanation</h3>
          <div className="flex items-baseline gap-1.5">
            <b className="text-5xl text-primary">{active?.score ?? 0}</b>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
          <div className="my-3 h-2 overflow-hidden rounded-full bg-muted">
            <span className="block h-full bg-primary" style={{ width: `${active?.score ?? 0}%` }} />
          </div>
          {(active?.breakdown ?? []).map((b) => (
            <div key={b.label} className="grid grid-cols-[120px_1fr_40px] items-center gap-2 py-1.5 text-[10px]">
              <span>{b.label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <i className="block h-full bg-primary" style={{ width: `${b.value}%` }} />
              </div>
              <b className="text-right">{b.value}</b>
            </div>
          ))}
          {active?.unplaced.length ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-warning-soft p-3 text-[11px] text-warning">
              <TriangleAlert className="size-4" />
              {active.unplaced.length} course(s) could not be placed — add rooms or relax a constraint.
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-wellness-soft p-3 text-[11px] text-wellness">
              <CheckCircle2 className="size-4" /> All hard constraints satisfied.
            </div>
          )}
        </div>
      </div>

      <div className="card-surface mt-4 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Ranked alternatives</h3>
          <Link to="/timetable" className="text-[11px] font-bold text-primary">
            Open timetable
          </Link>
        </div>
        <div className="grid gap-2">
          {schedules.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                active?.id === s.id ? "border-primary bg-primary-soft" : "bg-muted"
              }`}
            >
              <span>
                <b className="block text-[11px]">{s.name}</b>
                <span className="text-[10px] text-muted-foreground">
                  {s.slots.length} sessions placed
                </span>
              </span>
              <b className="text-sm text-primary">{s.score}</b>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
