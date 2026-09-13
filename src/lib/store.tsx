import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_ROOMS,
  SAMPLE_CSV,
  generateSchedules,
  parseCsv,
  type Course,
  type Schedule,
} from "./scheduler";

type Config = { protectWellness: boolean; spreadSubjects: boolean; morningHeavy: boolean };

type Store = {
  courses: Course[];
  setCourses: (c: Course[]) => void;
  config: Config;
  setConfig: (c: Config) => void;
  schedules: Schedule[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  active: Schedule | null;
  constraints: string[];
  addConstraints: (c: string[]) => void;
  regenerate: () => void;
  role: string;
  setRole: (r: string) => void;
};

const Ctx = createContext<Store | null>(null);
const KEY = "cognitisched-state-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(() => parseCsv(SAMPLE_CSV));
  const [config, setConfig] = useState<Config>({
    protectWellness: true,
    spreadSubjects: true,
    morningHeavy: false,
  });
  const [constraints, setConstraints] = useState<string[]>([
    "Hard: no faculty double-booking",
    "Hard: reserve cognitive-wellness blocks",
  ]);
  const [role, setRole] = useState("Administrator");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.courses?.length) setCourses(p.courses);
        if (p.config) setConfig(p.config);
        if (p.constraints) setConstraints(p.constraints);
        if (p.role) setRole(p.role);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ courses, config, constraints, role }));
    } catch {
      /* ignore */
    }
  }, [courses, config, constraints, role]);

  const schedules = useMemo(
    () => generateSchedules(courses, DEFAULT_ROOMS, config),
    [courses, config, version],
  );

  const active = schedules.find((s) => s.id === activeId) ?? schedules[0] ?? null;

  const value: Store = {
    courses,
    setCourses,
    config,
    setConfig,
    schedules,
    activeId,
    setActiveId,
    active,
    constraints,
    addConstraints: (c) => setConstraints((prev) => [...new Set([...prev, ...c])]),
    regenerate: () => setVersion((v) => v + 1),
    role,
    setRole,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
