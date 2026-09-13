import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { TimetableGrid } from "@/components/TimetableGrid";
import { useStore } from "@/lib/store";
import { toCsv } from "@/lib/scheduler";

export const Route = createFileRoute("/timetable")({
  head: () => ({
    meta: [
      { title: "Weekly Timetable — CognitiSched AI" },
      {
        name: "description",
        content:
          "View the generated weekly timetable with protected wellness blocks, and export it as CSV or print.",
      },
      { property: "og:title", content: "Weekly Timetable — CognitiSched AI" },
      {
        property: "og:description",
        content: "The generated weekly timetable with wellness blocks and CSV export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TimetablePage,
});

function TimetablePage() {
  const { active } = useStore();

  const download = () => {
    if (!active) return;
    const blob = new Blob([toCsv(active.slots)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cognitisched-timetable.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Timetable exported");
  };

  return (
    <AppLayout
      crumb="Schedule"
      title="Weekly Timetable"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2.5 text-xs font-bold"
          >
            <Printer className="size-3.5" /> Print
          </button>
          <button
            onClick={download}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
          >
            <Download className="size-3.5" /> Export CSV
          </button>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {active?.name} · score {active?.score} · {active?.slots.length} sessions
        </p>
        <div className="flex gap-4 text-[10px] text-muted-foreground">
          <span>
            <i className="mr-1.5 inline-block size-2 rounded-sm bg-primary" /> Class session
          </span>
          <span>
            <i className="mr-1.5 inline-block size-2 rounded-sm bg-wellness-soft" /> Wellness block
          </span>
        </div>
      </div>
      <TimetableGrid schedule={active} />
    </AppLayout>
  );
}
