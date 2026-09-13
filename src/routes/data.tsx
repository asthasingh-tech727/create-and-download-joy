import { createFileRoute } from "@tanstack/react-router";
import { Upload, RotateCcw, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";
import { DEFAULT_ROOMS, SAMPLE_CSV, parseCsv, type Course } from "@/lib/scheduler";

export const Route = createFileRoute("/data")({
  head: () => ({
    meta: [
      { title: "Courses & Data Import — CognitiSched AI" },
      {
        name: "description",
        content: "Import course CSVs, review faculty loads and room capacity before scheduling.",
      },
      { property: "og:title", content: "Courses & Data Import — CognitiSched AI" },
      {
        property: "og:description",
        content: "Import course CSVs and review rooms before generating a timetable.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DataPage,
});

const EMPTY: Course = {
  course_id: "",
  subject: "",
  faculty: "",
  batch: "",
  size: 40,
  type: "Classroom",
  hours: 2,
};

function DataPage() {
  const { courses, setCourses } = useStore();
  const [draft, setDraft] = useState<Course>(EMPTY);

  const onFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseCsv(text);
    if (!parsed.length) {
      toast.error("No rows found in that file");
      return;
    }
    setCourses(parsed);
    toast.success(`Imported ${parsed.length} courses`);
  };

  return (
    <AppLayout
      crumb="Inputs"
      title="Courses & Data"
      actions={
        <button
          onClick={() => {
            setCourses(parseCsv(SAMPLE_CSV));
            toast.success("Sample dataset loaded");
          }}
          className="inline-flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2.5 text-xs font-bold"
        >
          <RotateCcw className="size-3.5" /> Load sample
        </button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card-surface p-5">
          <h3 className="mb-3 text-sm font-semibold">Course list ({courses.length})</h3>
          <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 text-muted-foreground">
            <Upload className="size-4" />
            <span>
              <b className="block text-[11px] text-foreground">Upload CSV</b>
              <small className="text-[9px]">course_id, subject, faculty, batch, size, type, hours</small>
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>

          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["ID", "Subject", "Faculty", "Batch", "Size", "Type", "Hrs"].map((h) => (
                    <th key={h} className="border-b p-2 text-left label-caps">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.course_id}>
                    <td className="border-b p-2 text-[11px]">{c.course_id}</td>
                    <td className="border-b p-2 text-[11px] font-semibold">{c.subject}</td>
                    <td className="border-b p-2 text-[11px]">{c.faculty}</td>
                    <td className="border-b p-2 text-[11px]">{c.batch}</td>
                    <td className="border-b p-2 text-[11px]">{c.size}</td>
                    <td className="border-b p-2 text-[11px]">{c.type}</td>
                    <td className="border-b p-2 text-[11px]">{c.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="card-surface p-5">
            <h3 className="mb-3 text-sm font-semibold">Add a course</h3>
            <div className="grid gap-2">
              {(
                [
                  ["course_id", "Course ID"],
                  ["subject", "Subject"],
                  ["faculty", "Faculty"],
                  ["batch", "Batch"],
                ] as const
              ).map(([key, label]) => (
                <input
                  key={key}
                  placeholder={label}
                  value={draft[key] as string}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className="h-9 rounded-lg border bg-card px-3 text-xs outline-none focus:border-primary"
                />
              ))}
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  aria-label="Size"
                  value={draft.size}
                  onChange={(e) => setDraft({ ...draft, size: Number(e.target.value) })}
                  className="h-9 rounded-lg border bg-card px-3 text-xs outline-none focus:border-primary"
                />
                <select
                  aria-label="Type"
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value as Course["type"] })}
                  className="h-9 rounded-lg border bg-card px-2 text-xs outline-none"
                >
                  <option>Classroom</option>
                  <option>Lab</option>
                </select>
                <input
                  type="number"
                  aria-label="Hours"
                  value={draft.hours}
                  onChange={(e) => setDraft({ ...draft, hours: Number(e.target.value) })}
                  className="h-9 rounded-lg border bg-card px-3 text-xs outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={() => {
                  if (!draft.subject || !draft.faculty) {
                    toast.error("Subject and faculty required");
                    return;
                  }
                  setCourses([
                    ...courses,
                    { ...draft, course_id: draft.course_id || `C${courses.length + 1}` },
                  ]);
                  setDraft(EMPTY);
                  toast.success("Course added");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"
              >
                <Plus className="size-3.5" /> Add course
              </button>
            </div>
          </div>

          <div className="card-surface p-5">
            <h3 className="mb-3 text-sm font-semibold">Rooms</h3>
            {DEFAULT_ROOMS.map((r) => (
              <div key={r.name} className="flex items-center gap-3 border-t py-2.5 first:border-t-0">
                <b className="text-xs">{r.name}</b>
                <small className="text-[10px] text-muted-foreground">{r.type}</small>
                <span className="ml-auto rounded-full bg-muted px-2.5 py-1 text-[9px]">
                  {r.capacity} seats
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
