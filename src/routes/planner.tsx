import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarRange,
  Clock,
  Coffee,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AiLoading,
  BulletList,
  Chip,
  EmptyState,
  ErrorState,
  Field,
  PageHeader,
  Panel,
  PriorityBadge,
  ResponsibleAi,
} from "@/components/ui-kit";
import { buildSchedule } from "@/lib/ai.functions";
import type { PlanResult, Priority, Task } from "@/lib/ai-types";
import { usePersona, useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Smart Task Planner — WorkWise AI" },
      {
        name: "description",
        content:
          "Capture tasks, then let WorkWise AI build a realistic prioritised day plan with time blocks, breaks and reasoning.",
      },
      { property: "og:title", content: "Smart Task Planner — WorkWise AI" },
      {
        property: "og:description",
        content: "Realistic AI-built day plans with priorities, time blocks and reasoning.",
      },
    ],
  }),
  component: PlannerPage,
});

const views = ["Today", "This Week", "Priority", "Completed"] as const;
const categories = [
  "Client Work",
  "Meetings",
  "Research",
  "Analysis",
  "Communication",
  "Presentation",
  "Career Growth",
  "Project Management",
];

function filterTasks(tasks: Task[], view: (typeof views)[number]) {
  if (view === "Completed") return tasks.filter((t) => t.completed);
  const open = tasks.filter((t) => !t.completed);
  if (view === "Today")
    return open.filter((t) => t.deadline.toLowerCase() === "today");
  if (view === "Priority") {
    const rank = { High: 0, Medium: 1, Low: 2 } as const;
    return [...open].sort((a, b) => rank[a.priority] - rank[b.priority]);
  }
  return open;
}

function PlannerPage() {
  const persona = usePersona();
  const { profile, tasks, addTask, toggleTask, removeTask, logActivity } =
    useWorkspace();

  const [view, setView] = useState<(typeof views)[number]>("Today");
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("Today");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [duration, setDuration] = useState("1h");
  const [category, setCategory] = useState("Client Work");

  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const visible = filterTasks(tasks, view);

  const add = () => {
    if (!name.trim()) {
      toast.error("Give the task a name.");
      return;
    }
    addTask({ name: name.trim(), deadline, priority, duration, category });
    setName("");
    toast.success("Task added.");
  };

  const generate = async () => {
    const open = tasks.filter((t) => !t.completed);
    if (!open.length) {
      toast.error("Add at least one open task first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await buildSchedule({
        data: {
          tasks: open.map((t) => ({
            name: t.name,
            deadline: t.deadline,
            priority: t.priority,
            duration: t.duration,
            category: t.category,
          })),
          workStart: profile.workStart,
          workEnd: profile.workEnd,
          style: profile.prioritStyle,
          persona,
        },
      });
      setPlan(res);
      logActivity({
        kind: "planner",
        title: "Schedule created",
        detail: `${res.blocks.length} focus blocks — ${res.total_planned}`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Smart Planner"
        title="Plan a day you can actually finish"
        description="WorkWise AI ranks by deadline pressure, priority and effort, then blocks your working hours realistically — with reasoning you can defend."
        actions={
          <Button onClick={generate} disabled={loading}>
            <Wand2 className="size-4" />
            {loading ? "Prioritising..." : "Generate my schedule"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Panel title="Add a task" description="Manual capture — AI planning is optional.">
            <div className="space-y-4">
              <Field label="Task name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && add()}
                  placeholder="e.g. Draft Q3 client proposal"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Deadline">
                  <Input
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="Today / Friday / 12 Sep"
                  />
                </Field>
                <Field label="Estimated duration">
                  <Input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 1h 30m"
                  />
                </Field>
                <Field label="Priority">
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v as Priority)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["High", "Medium", "Low"] as const).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Category">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Button variant="secondary" className="w-full" onClick={add}>
                <Plus className="size-4" />
                Add task
              </Button>
            </div>
          </Panel>

          <Panel title="Your tasks">
            <Tabs
              value={view}
              onValueChange={(v) => setView(v as (typeof views)[number])}
            >
              <TabsList className="w-full">
                {views.map((v) => (
                  <TabsTrigger key={v} value={v} className="flex-1 text-xs">
                    {v}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="mt-4 space-y-2">
              {visible.length === 0 && (
                <EmptyState
                  icon={CalendarRange}
                  title="Nothing here"
                  description={
                    view === "Completed"
                      ? "Completed tasks will appear here once you tick them off."
                      : "No tasks match this view yet."
                  }
                />
              )}
              {visible.map((t) => (
                <div
                  key={t.id}
                  className="group flex items-start gap-3 rounded-xl border border-border p-3.5 transition-colors hover:bg-surface/70"
                >
                  <button
                    type="button"
                    aria-label={t.completed ? "Mark incomplete" : "Mark complete"}
                    onClick={() => toggleTask(t.id)}
                    className={`mt-0.5 size-4.5 shrink-0 rounded-md border-2 transition-all ${
                      t.completed
                        ? "border-growth bg-growth"
                        : "border-border hover:border-growth"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        t.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {t.name}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <PriorityBadge value={t.priority} />
                      <Chip>Due {t.deadline}</Chip>
                      <Chip>{t.duration}</Chip>
                      <Chip tone="sky">{t.category}</Chip>
                      {t.source && <Chip tone="growth">from meeting</Chip>}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Delete task"
                    onClick={() => removeTask(t.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          {loading && <AiLoading message="Prioritising your tasks..." />}
          {!loading && error && <ErrorState message={error} onRetry={generate} />}
          {!loading && !error && !plan && (
            <Panel>
              <EmptyState
                icon={Sparkles}
                title="No schedule generated yet"
                description="Press 'Generate my schedule' and WorkWise AI will build realistic time blocks around your working hours."
              />
            </Panel>
          )}
          {!loading && plan && (
            <div className="space-y-4 rise">
              <Panel title="Prioritisation strategy" description={plan.total_planned}>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {plan.strategy}
                </p>
              </Panel>

              <Panel title="Today's schedule">
                <ol className="relative space-y-3 border-l border-border pl-5">
                  {plan.blocks.map((b, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[1.6rem] top-3 size-2.5 rounded-full bg-growth ring-4 ring-background" />
                      <div className="rounded-xl border border-border bg-surface/50 p-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky">
                            <Clock className="size-3.5" />
                            {b.scheduled_time}
                          </span>
                          <PriorityBadge value={String(b.priority)} />
                        </div>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {b.task}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Chip>Due {b.deadline}</Chip>
                          <Chip>{b.estimated_duration}</Chip>
                          {b.category && <Chip tone="sky">{b.category}</Chip>}
                        </div>
                        <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                          {b.reason}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Panel>

              {!!plan.breaks?.length && (
                <Panel title="Recommended breaks">
                  <ul className="space-y-2">
                    {plan.breaks.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 rounded-lg bg-growth-soft/60 px-3.5 py-2.5"
                      >
                        <Coffee className="size-3.5 shrink-0 text-growth" />
                        <span className="text-xs font-semibold text-growth">
                          {b.time}
                        </span>
                        <span className="text-sm text-foreground/85">{b.note}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}

              <Panel title="Planner insights">
                <BulletList items={plan.insights} />
              </Panel>
            </div>
          )}
        </div>
      </div>

      <ResponsibleAi />
    </div>
  );
}
