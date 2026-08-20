import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  CircleAlert,
  Flame,
  ListChecks,
  Mail,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AiLoading,
  Chip,
  ErrorState,
  Panel,
  PriorityBadge,
  ResponsibleAi,
} from "@/components/ui-kit";
import { productivityInsights } from "@/lib/ai.functions";
import { usePersona, useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — WorkWise AI" },
      {
        name: "description",
        content:
          "Your workday at a glance: priorities, deadlines, AI productivity insights and recent activity across WorkWise AI.",
      },
      { property: "og:title", content: "Dashboard — WorkWise AI" },
      {
        property: "og:description",
        content:
          "Priorities, deadlines and AI productivity insights in one intelligent workspace.",
      },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const activityIcon = {
  email: Mail,
  meeting: BookOpenCheck,
  planner: CalendarClock,
  research: Sparkles,
  chat: Wand2,
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Mail;
  tone: "navy" | "growth" | "sky" | "warn";
}) {
  const toneClass = {
    navy: "bg-primary/10 text-primary",
    growth: "bg-growth-soft text-growth",
    sky: "bg-sky-soft text-sky",
    warn: "bg-warn-soft text-warn",
  }[tone];
  return (
    <div className="surface-card lift p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className={`grid size-8 place-items-center rounded-lg ${toneClass}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Dashboard() {
  const { profile, tasks, activity } = useWorkspace();
  const persona = usePersona();
  const [insights, setInsights] = useState<
    { headline: string; detail: string; type: string }[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const open = tasks.filter((t) => !t.completed);
  const dueToday = open.filter((t) => t.deadline.toLowerCase() === "today");
  const high = open.filter((t) => t.priority === "High");
  const upcoming = open.filter((t) =>
    ["tomorrow", "friday", "monday", "next week"].includes(
      t.deadline.toLowerCase(),
    ),
  );
  const priorities = [...open]
    .sort((a, b) => {
      const rank = { High: 0, Medium: 1, Low: 2 } as const;
      return rank[a.priority] - rank[b.priority];
    })
    .slice(0, 3);

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const summary = [
        `Working hours: ${profile.workStart}-${profile.workEnd}.`,
        `Open tasks: ${open.length}. High priority: ${high.length}. Due today: ${dueToday.length}.`,
        ...open.map(
          (t) =>
            `- ${t.name} | ${t.priority} | due ${t.deadline} | est ${t.duration} | ${t.category}`,
        ),
      ].join("\n");
      const res = await productivityInsights({
        data: { summary, persona },
      });
      setInsights(res.insights ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl gradient-hero px-6 py-8 text-primary-foreground sm:px-8 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">
          {greeting()}, {profile.name.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-primary-foreground/75">
          Here's what needs your attention today.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link to="/planner">
              <ListChecks className="size-4" />
              Plan my day
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link to="/assistant">
              Ask WorkWise AI
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tasks due today"
          value={String(dueToday.length)}
          hint={`${open.length} open in total`}
          icon={ListChecks}
          tone="navy"
        />
        <StatCard
          label="High priority"
          value={String(high.length)}
          hint="Needs focused time"
          icon={Flame}
          tone="warn"
        />
        <StatCard
          label="Upcoming deadlines"
          value={String(upcoming.length)}
          hint="Within the next week"
          icon={CalendarClock}
          tone="sky"
        />
        <StatCard
          label="Recent AI activity"
          value={String(activity.length)}
          hint="Actions across your workspace"
          icon={Sparkles}
          tone="growth"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Today's priorities"
          description="Ranked by priority and deadline pressure."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link to="/planner">Open planner</Link>
            </Button>
          }
        >
          <ol className="space-y-3">
            {priorities.map((t, i) => (
              <li
                key={t.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3.5 transition-colors hover:bg-surface"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <PriorityBadge value={t.priority} />
                    <Chip>Due {t.deadline}</Chip>
                    <Chip>{t.duration}</Chip>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Upcoming
            </p>
            <div className="space-y-2">
              {upcoming.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5"
                >
                  <span className="truncate text-sm text-foreground">{t.name}</span>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {t.deadline}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel
            title="AI productivity insights"
            description="Analysis of your live workload."
            actions={
              <Button size="sm" onClick={run} disabled={loading}>
                <Wand2 className="size-3.5" />
                {insights ? "Refresh" : "Analyse"}
              </Button>
            }
          >
            {loading && <AiLoading message="Analysing your workload..." />}
            {!loading && error && <ErrorState message={error} onRetry={run} />}
            {!loading && !error && !insights && (
              <div className="rounded-xl bg-accent/60 p-4">
                <p className="flex items-start gap-2 text-sm text-accent-foreground">
                  <CircleAlert className="mt-0.5 size-4 shrink-0" />
                  <span>
                    You have {high.length} high-priority tasks today. Consider
                    completing the proposal before starting lower-priority
                    research.
                  </span>
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Run an analysis for insights generated from your current tasks.
                </p>
              </div>
            )}
            {!loading && insights && (
              <ul className="space-y-3">
                {insights.map((ins, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-border bg-surface/60 p-3.5 rise"
                  >
                    <div className="flex items-center gap-2">
                      <Chip tone="growth">{ins.type}</Chip>
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {ins.headline}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ins.detail}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent activity" description="Across all WorkWise tools.">
            <ul className="space-y-3">
              {activity.slice(0, 6).map((a) => {
                const Icon = activityIcon[a.kind];
                return (
                  <li key={a.id} className="flex gap-3">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {a.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.detail}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70">{a.at}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>

      <ResponsibleAi />
    </div>
  );
}
