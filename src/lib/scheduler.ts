export type Course = {
  course_id: string;
  subject: string;
  faculty: string;
  batch: string;
  size: number;
  type: "Classroom" | "Lab";
  hours: number;
};

export type Room = { name: string; capacity: number; type: "Classroom" | "Lab" };

export type Slot = {
  id: string;
  day: string;
  period: number;
  course: Course;
  room: string;
};

export type Schedule = {
  id: string;
  name: string;
  slots: Slot[];
  score: number;
  breakdown: { label: string; value: number }[];
  unplaced: Course[];
};

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const PERIODS = [
  { label: "09:00", sub: "09:00 - 10:00" },
  { label: "10:00", sub: "10:00 - 11:00" },
  { label: "11:00", sub: "11:00 - 12:00" },
  { label: "12:00", sub: "12:00 - 13:00" },
  { label: "14:00", sub: "14:00 - 15:00" },
  { label: "15:00", sub: "15:00 - 16:00" },
];

/** Cognitive-wellness reservations: [day index, period index] kept class-free. */
export const WELLNESS_BLOCKS: [number, number][] = [
  [0, 3],
  [1, 3],
  [2, 3],
  [3, 3],
  [4, 3],
  [2, 5],
];

export const isWellness = (d: number, p: number) =>
  WELLNESS_BLOCKS.some(([wd, wp]) => wd === d && wp === p);

export const DEFAULT_ROOMS: Room[] = [
  { name: "R-101", capacity: 60, type: "Classroom" },
  { name: "R-102", capacity: 60, type: "Classroom" },
  { name: "R-201", capacity: 45, type: "Classroom" },
  { name: "Lab-A", capacity: 40, type: "Lab" },
  { name: "Lab-B", capacity: 40, type: "Lab" },
];

export const SAMPLE_CSV = `course_id,subject,faculty,batch,size,type,hours
C1,Data Structures,Dr. Ananya Rao,CSE-A,55,Classroom,3
C2,Database Systems,Prof. Vikram Shah,CSE-A,55,Classroom,3
C3,Operating Systems,Dr. Meera Iyer,CSE-A,55,Classroom,3
C4,Computer Networks,Prof. Karan Patel,CSE-A,55,Classroom,3
C5,AI & ML,Dr. Neha Singh,CSE-A,55,Classroom,3
C6,AI Lab,Dr. Neha Singh,CSE-B,38,Lab,2`;

export function parseCsv(text: string): Course[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const head = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (k: string) => head.indexOf(k);
  return lines.slice(1).map((line, i) => {
    const c = line.split(",").map((v) => v.trim());
    return {
      course_id: c[idx("course_id")] || `C${i + 1}`,
      subject: c[idx("subject")] || "Untitled",
      faculty: c[idx("faculty")] || "TBD",
      batch: c[idx("batch")] || "General",
      size: Number(c[idx("size")]) || 30,
      type: (c[idx("type")] === "Lab" ? "Lab" : "Classroom") as Course["type"],
      hours: Number(c[idx("hours")]) || 1,
    };
  });
}

export function toCsv(slots: Slot[]) {
  const rows = slots.map(
    (s) =>
      `${s.day},${PERIODS[s.period].sub},${s.course.subject},${s.course.faculty},${s.course.batch},${s.room}`,
  );
  return ["day,time,subject,faculty,batch,room", ...rows].join("\n");
}

type Options = {
  protectWellness: boolean;
  spreadSubjects: boolean;
  morningHeavy: boolean;
  seed: number;
};

/** Greedy + backtracking-lite feasibility search over hard constraints. */
function solve(courses: Course[], rooms: Room[], opt: Options): Schedule["slots"] & Slot[] {
  const busyFaculty = new Set<string>();
  const busyBatch = new Set<string>();
  const busyRoom = new Set<string>();
  const perDayBatchSubject = new Map<string, number>();
  const slots: Slot[] = [];

  const units = courses.flatMap((c) =>
    Array.from({ length: c.hours }, (_, i) => ({ c, i })),
  );

  // deterministic shuffle based on seed
  units.sort((a, b) => {
    const h = (s: string) =>
      [...s].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0) + opt.seed) % 9973, 7);
    return h(a.c.course_id + a.i) - h(b.c.course_id + b.i);
  });

  for (const { c } of units) {
    let placed = false;
    const dayOrder = DAYS.map((_, i) => i);
    for (const d of dayOrder) {
      const periodOrder = PERIODS.map((_, i) => i).sort((a, b) =>
        opt.morningHeavy ? a - b : 0,
      );
      for (const p of periodOrder) {
        if (opt.protectWellness && isWellness(d, p)) continue;
        const key = `${d}-${p}`;
        if (busyFaculty.has(`${c.faculty}|${key}`)) continue;
        if (busyBatch.has(`${c.batch}|${key}`)) continue;
        if (
          opt.spreadSubjects &&
          (perDayBatchSubject.get(`${c.course_id}|${d}`) ?? 0) >= 1
        )
          continue;
        const room = rooms.find(
          (r) =>
            r.type === c.type && r.capacity >= c.size && !busyRoom.has(`${r.name}|${key}`),
        );
        if (!room) continue;
        busyFaculty.add(`${c.faculty}|${key}`);
        busyBatch.add(`${c.batch}|${key}`);
        busyRoom.add(`${room.name}|${key}`);
        perDayBatchSubject.set(
          `${c.course_id}|${d}`,
          (perDayBatchSubject.get(`${c.course_id}|${d}`) ?? 0) + 1,
        );
        slots.push({ id: `${c.course_id}-${key}`, day: DAYS[d], period: p, course: c, room: room.name });
        placed = true;
        break;
      }
      if (placed) break;
    }
  }
  return slots;
}

export function generateSchedules(
  courses: Course[],
  rooms: Room[],
  config: { protectWellness: boolean; spreadSubjects: boolean; morningHeavy: boolean },
): Schedule[] {
  const names = ["Balanced Optimum", "Faculty Friendly", "Compact Mornings"];
  const schedules = names.map((name, i) => {
    const opt: Options = { ...config, seed: i * 13 + 3, morningHeavy: config.morningHeavy || i === 2 };
    const slots = solve(courses, rooms, opt);
    const totalUnits = courses.reduce((a, c) => a + c.hours, 0);
    const coverage = totalUnits ? (slots.length / totalUnits) * 100 : 0;

    const morning = slots.filter((s) => s.period <= 2).length;
    const cognitive = totalUnits ? (morning / Math.max(slots.length, 1)) * 100 : 0;
    const wellnessKept = config.protectWellness ? 100 : 55;

    const perDay = DAYS.map((d) => slots.filter((s) => s.day === d).length);
    const avg = perDay.reduce((a, b) => a + b, 0) / DAYS.length || 0;
    const spread =
      100 - Math.min(100, (Math.max(...perDay, 0) - Math.min(...perDay, 0)) * 12 + Math.abs(avg - 3) * 5);

    const utilisation = Math.min(100, (slots.length / (DAYS.length * PERIODS.length)) * 160);

    const breakdown = [
      { label: "Constraint coverage", value: Math.round(coverage) },
      { label: "Cognitive load fit", value: Math.round(cognitive) },
      { label: "Wellness protection", value: wellnessKept },
      { label: "Day balance", value: Math.round(Math.max(0, spread)) },
      { label: "Room utilisation", value: Math.round(utilisation) },
    ];
    const score = Math.round(
      breakdown.reduce((a, b) => a + b.value, 0) / breakdown.length,
    );
    const placedIds = new Set(slots.map((s) => s.course.course_id));
    const unplaced = courses.filter(
      (c) => slots.filter((s) => s.course.course_id === c.course_id).length < c.hours && !placedIds.has(c.course_id),
    );
    return { id: `alt-${i}`, name, slots, score, breakdown, unplaced };
  });
  return schedules.sort((a, b) => b.score - a.score);
}

/** Lightweight natural-language requirement parser (LLM boundary stand-in). */
export function parseRequirement(text: string) {
  const t = text.toLowerCase();
  const out: string[] = [];
  if (/(no|avoid).*(friday|fri)/.test(t)) out.push("Hard: no sessions on Friday");
  if (/(morning|before noon|am)/.test(t)) out.push("Soft: prefer morning periods");
  if (/lab/.test(t)) out.push("Hard: labs only in lab-type rooms");
  if (/(break|wellness|rest|lunch)/.test(t)) out.push("Hard: reserve cognitive-wellness blocks");
  if (/(back[- ]?to[- ]?back|consecutive)/.test(t)) out.push("Soft: limit back-to-back sessions");
  if (/(faculty|teacher|professor)/.test(t)) out.push("Hard: no faculty double-booking");
  return out.length ? out : ["Soft: balance sessions evenly across the week"];
}
