import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Wand2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";
import { parseRequirement } from "@/lib/scheduler";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Requirements Assistant — CognitiSched AI" },
      {
        name: "description",
        content:
          "Describe scheduling rules in plain English and turn them into structured solver constraints.",
      },
      { property: "og:title", content: "AI Requirements Assistant — CognitiSched AI" },
      {
        property: "og:description",
        content: "Turn plain-English scheduling rules into structured solver constraints.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

const EXAMPLES = [
  "No labs on Friday afternoon",
  "Keep a rest break after every two lectures",
  "Dr. Neha Singh prefers morning classes",
  "Avoid back-to-back sessions for CSE-A",
];

function AssistantPage() {
  const { addConstraints, constraints } = useStore();
  const [text, setText] = useState("");
  const [result, setResult] = useState<string[] | null>(null);

  const run = () => {
    if (!text.trim()) {
      toast.error("Describe a requirement first");
      return;
    }
    const parsed = parseRequirement(text);
    setResult(parsed);
    addConstraints(parsed);
    toast.success("Constraints added to the solver");
  };

  return (
    <AppLayout crumb="Natural language" title="AI Assistant">
      <div className="mb-4 flex items-center gap-4 rounded-xl border bg-primary-soft p-5">
        <div className="grid size-13 shrink-0 place-items-center rounded-xl bg-primary p-3 text-primary-foreground">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Describe your rules, not the algorithm</h2>
          <p className="text-[11px] text-muted-foreground">
            The assistant converts requirements into structured constraints. The solver stays
            responsible for building the schedule.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card-surface p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Labs must be in the morning and every batch needs a wellness break after lunch."
            className="mb-2.5 min-h-[130px] w-full resize-y rounded-lg border p-3 text-xs outline-none focus:border-primary"
          />
          <button
            onClick={run}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-glow"
          >
            <Wand2 className="size-3.5" /> Convert to constraints
          </button>
          {result && (
            <div className="mt-3 rounded-lg bg-wellness-soft p-3 text-wellness">
              <b className="text-[11px]">Structured output</b>
              {result.map((r) => (
                <p key={r} className="my-1 text-[10px]">
                  • {r}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="grid content-start gap-4">
          <div className="card-surface p-5">
            <h3 className="mb-3 text-sm font-semibold">Try an example</h3>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((e) => (
                <button
                  key={e}
                  onClick={() => setText(e)}
                  className="rounded-full border bg-muted px-2.5 py-2 text-[9px] text-muted-foreground"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="card-surface p-5">
            <h3 className="mb-3 text-sm font-semibold">Constraint set</h3>
            {constraints.map((c) => (
              <div key={c} className="flex items-start gap-2 border-t py-2.5 text-[10px] first:border-t-0">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-wellness" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
