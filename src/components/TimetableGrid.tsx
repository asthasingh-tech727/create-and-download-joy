import { Leaf } from "lucide-react";
import { DAYS, PERIODS, isWellness, type Schedule } from "@/lib/scheduler";

export function TimetableGrid({ schedule }: { schedule: Schedule | null }) {
  if (!schedule) return null;
  return (
    <div className="card-surface overflow-auto">
      <div className="grid min-w-[850px] grid-cols-[105px_repeat(5,minmax(145px,1fr))]">
        <div className="border-r border-b p-3 label-caps">Time</div>
        {DAYS.map((d) => (
          <div key={d} className="border-r border-b p-3">
            <div className="label-caps">{d}</div>
          </div>
        ))}

        {PERIODS.map((p, pi) => (
          <div key={p.label} className="contents">
            <div className="border-r border-b p-3 text-[10px] text-muted-foreground">
              {p.label}
              <small className="block text-[9px] opacity-70">{p.sub}</small>
            </div>
            {DAYS.map((d, di) => {
              const slot = schedule.slots.find((s) => s.day === d && s.period === pi);
              const wellness = isWellness(di, pi);
              return (
                <div
                  key={d + pi}
                  className={`min-h-[84px] border-r border-b p-2 ${wellness && !slot ? "bg-wellness-soft" : ""}`}
                >
                  {slot ? (
                    <div className="h-full rounded-md border-l-[3px] border-primary bg-primary-soft p-2">
                      <b className="block text-[10px] leading-tight">{slot.course.subject}</b>
                      <small className="mt-1 block text-[8px] text-muted-foreground">
                        {slot.course.faculty}
                      </small>
                      <span className="mt-0.5 block text-[8px] text-muted-foreground">
                        {slot.room} · {slot.course.batch}
                      </span>
                    </div>
                  ) : wellness ? (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-[8px] text-wellness">
                      <Leaf className="size-3" />
                      Wellness block
                    </div>
                  ) : (
                    <span className="text-[8px] text-muted-foreground/50">Free</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
