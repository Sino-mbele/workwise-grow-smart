import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ActivityItem,
  MeetingResult,
  Profile,
  SavedItem,
  Task,
} from "./ai-types";
import {
  defaultProfile,
  demoActivity,
  demoSaved,
  demoTasks,
} from "./demo-data";

const KEY = "workwise-ai-state-v1";

type State = {
  profile: Profile;
  tasks: Task[];
  activity: ActivityItem[];
  saved: SavedItem[];
  lastMeeting: MeetingResult | null;
};

type Ctx = State & {
  hydrated: boolean;
  setProfile: (p: Profile) => void;
  addTask: (t: Omit<Task, "id" | "completed">) => void;
  addTasks: (t: Omit<Task, "id" | "completed">[]) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  logActivity: (a: Omit<ActivityItem, "id" | "at">) => void;
  save: (s: Omit<SavedItem, "id" | "at">) => void;
  removeSaved: (id: string) => void;
  setLastMeeting: (m: MeetingResult | null) => void;
  reset: () => void;
};

const initial: State = {
  profile: defaultProfile,
  tasks: demoTasks,
  activity: demoActivity,
  saved: demoSaved,
  lastMeeting: null,
};

const WorkspaceContext = createContext<Ctx | null>(null);

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function stamp() {
  return new Date().toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...(JSON.parse(raw) as State) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }, [state, hydrated]);

  const logActivity = useCallback((a: Omit<ActivityItem, "id" | "at">) => {
    setState((s) => ({
      ...s,
      activity: [{ ...a, id: uid(), at: stamp() }, ...s.activity].slice(0, 20),
    }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      hydrated,
      setProfile: (profile) => setState((s) => ({ ...s, profile })),
      addTask: (t) =>
        setState((s) => ({
          ...s,
          tasks: [{ ...t, id: uid(), completed: false }, ...s.tasks],
        })),
      addTasks: (list) =>
        setState((s) => ({
          ...s,
          tasks: [
            ...list.map((t) => ({ ...t, id: uid(), completed: false })),
            ...s.tasks,
          ],
        })),
      toggleTask: (id) =>
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t,
          ),
        })),
      removeTask: (id) =>
        setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
      logActivity,
      save: (item) =>
        setState((s) => ({
          ...s,
          saved: [{ ...item, id: uid(), at: stamp() }, ...s.saved],
        })),
      removeSaved: (id) =>
        setState((s) => ({ ...s, saved: s.saved.filter((x) => x.id !== id) })),
      setLastMeeting: (lastMeeting) => setState((s) => ({ ...s, lastMeeting })),
      reset: () => setState(initial),
    }),
    [state, hydrated, logActivity],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}

export function usePersona() {
  const { profile } = useWorkspace();
  return {
    name: profile.name,
    role: profile.role,
    industry: profile.industry,
  };
}

export function useWorkspaceContextText() {
  const { profile, tasks, lastMeeting } = useWorkspace();
  const open = tasks.filter((t) => !t.completed);
  const lines = [
    `Profile: ${profile.name}, ${profile.role}, ${profile.industry}. Working hours ${profile.workStart}-${profile.workEnd}. Preferred email tone: ${profile.tone}.`,
    `Open tasks (${open.length}):`,
    ...open
      .slice(0, 12)
      .map(
        (t) =>
          `- ${t.name} [${t.priority}] due ${t.deadline}, est ${t.duration}, ${t.category}`,
      ),
  ];
  if (lastMeeting) {
    lines.push(
      `Most recent meeting summary (${lastMeeting.title}): ${lastMeeting.summary}`,
    );
    if (lastMeeting.action_items?.length) {
      lines.push(
        `Meeting action items: ${lastMeeting.action_items
          .map((a) => `${a.task} (${a.owner}, ${a.deadline})`)
          .join("; ")}`,
      );
    }
  }
  return lines.join("\n");
}
