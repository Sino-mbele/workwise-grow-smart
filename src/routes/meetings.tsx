import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  Download,
  FileText,
  ListPlus,
  RefreshCw,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AiLoading,
  BulletList,
  Chip,
  CopyButton,
  EmptyState,
  ErrorState,
  PageHeader,
  Panel,
  PriorityBadge,
  ResponsibleAi,
} from "@/components/ui-kit";
import { summarizeMeeting } from "@/lib/ai.functions";
import type { MeetingResult, Priority } from "@/lib/ai-types";
import { sampleMeetingNotes } from "@/lib/demo-data";
import { usePersona, useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Intelligence — WorkWise AI" },
      {
        name: "description",
        content:
          "Turn meeting notes and transcripts into an executive summary, decisions, owned action items and flagged risks.",
      },
      { property: "og:title", content: "Meeting Intelligence — WorkWise AI" },
      {
        property: "og:description",
        content: "Summaries, decisions and owned action items from raw meeting notes.",
      },
    ],
  }),
  component: MeetingsPage,
});

function toText(r: MeetingResult) {
  return [
    r.title,
    "",
    "EXECUTIVE SUMMARY",
    r.summary,
    "",
    "KEY DISCUSSION POINTS",
    ...r.discussion_points.map((d) => `- ${d}`),
    "",
    "DECISIONS MADE",
    ...r.decisions.map((d) => `- ${d}`),
    "",
    "ACTION ITEMS",
    ...r.action_items.map(
      (a) => `- ${a.task} | ${a.owner} | ${a.deadline} | ${a.priority}`,
    ),
    "",
    "RISKS / OPEN QUESTIONS",
    ...r.risks.map((d) => `- ${d}`),
  ].join("\n");
}

function MeetingsPage() {
  const persona = usePersona();
  const { addTasks, logActivity, save, setLastMeeting } = useWorkspace();
  const navigate = useNavigate();

  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const run = async () => {
    if (notes.trim().length < 30) {
      toast.error("Paste at least a few lines of meeting notes.");
      return;
    }
    setLoading(true);
    setError("");
    setAdded(false);
    try {
      const res = await summarizeMeeting({ data: { notes, persona } });
      setResult(res);
      setLastMeeting(res);
      logActivity({
        kind: "meeting",
        title: "Meeting summarised",
        detail: `${res.title} — ${res.action_items.length} action items extracted`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const addToPlanner = () => {
    if (!result?.action_items.length) return;
    addTasks(
      result.action_items.map((a) => ({
        name: a.task,
        deadline: a.deadline || "Not specified",
        priority: (["High", "Medium", "Low"].includes(String(a.priority))
          ? a.priority
          : "Medium") as Priority,
        duration: "45m",
        category: "Meetings",
        source: result.title,
      })),
    );
    setAdded(true);
    toast.success(`${result.action_items.length} action items added to Smart Planner.`, {
      action: {
        label: "Open planner",
        onClick: () => void navigate({ to: "/planner" }),
      },
    });
  };

  const exportSummary = () => {
    if (!result) return;
    const blob = new Blob([toText(result)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.replace(/[^\w -]/g, "").slice(0, 60) || "meeting-summary"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary exported.");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Meeting Intelligence"
        title="Meeting notes summariser"
        description="Paste raw notes or a transcript. WorkWise AI separates discussion from decisions, assigns owners and surfaces open risks."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotes(sampleMeetingNotes)}
          >
            Load sample notes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)]">
        <Panel
          title="Meeting notes"
          description="Messy bullet points work fine — no formatting required."
        >
          <Textarea
            rows={18}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your meeting notes or transcript here..."
            className="text-sm leading-relaxed"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {notes.trim() ? `${notes.trim().split(/\s+/).length} words` : "Empty"}
            </span>
            {notes && (
              <button
                type="button"
                onClick={() => setNotes("")}
                className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <Button className="mt-4 w-full" onClick={run} disabled={loading}>
            <Wand2 className="size-4" />
            {loading ? "Analysing..." : "Summarise meeting"}
          </Button>
        </Panel>

        <div className="space-y-4">
          {loading && <AiLoading message="Analysing your notes..." />}
          {!loading && error && <ErrorState message={error} onRetry={run} />}
          {!loading && !error && !result && (
            <Panel>
              <EmptyState
                icon={FileText}
                title="No summary yet"
                description="Paste notes on the left, or load the sample meeting to see how the extraction works."
              />
            </Panel>
          )}

          {!loading && result && (
            <div className="space-y-4 rise">
              <Panel
                title={result.title}
                description="Executive summary"
                actions={
                  <>
                    <CopyButton text={toText(result)} label="Copy summary" />
                    <Button variant="outline" size="sm" onClick={exportSummary}>
                      <Download className="size-3.5" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={run}>
                      <RefreshCw className="size-3.5" />
                      Regenerate
                    </Button>
                  </>
                }
              >
                <p className="text-sm leading-relaxed text-foreground/90">
                  {result.summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip tone="sky">{result.decisions.length} decisions</Chip>
                  <Chip tone="growth">
                    {result.action_items.length} action items
                  </Chip>
                  <Chip>{result.risks.length} risks / open questions</Chip>
                </div>
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      save({
                        kind: "meeting",
                        title: result.title,
                        content: toText(result),
                      });
                      toast.success("Saved to Saved Work.");
                    }}
                  >
                    Save summary
                  </Button>
                </div>
              </Panel>

              <Panel
                title="Action items"
                description="Owners and deadlines are only taken from your notes."
                actions={
                  <Button size="sm" onClick={addToPlanner} disabled={added}>
                    {added ? (
                      <Check className="size-3.5" />
                    ) : (
                      <ListPlus className="size-3.5" />
                    )}
                    {added ? "Added to planner" : "Add to Smart Planner"}
                  </Button>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[540px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="pb-2 pr-3 font-semibold">Action item</th>
                        <th className="pb-2 pr-3 font-semibold">Owner</th>
                        <th className="pb-2 pr-3 font-semibold">Deadline</th>
                        <th className="pb-2 font-semibold">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.action_items.map((a, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface/70"
                        >
                          <td className="py-3 pr-3 font-medium text-foreground">
                            {a.task}
                          </td>
                          <td className="py-3 pr-3 text-muted-foreground">
                            {a.owner}
                          </td>
                          <td className="py-3 pr-3 text-muted-foreground">
                            {a.deadline}
                          </td>
                          <td className="py-3">
                            <PriorityBadge value={String(a.priority)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <div className="grid gap-4 md:grid-cols-2">
                <Panel title="Key discussion points">
                  <BulletList items={result.discussion_points} />
                </Panel>
                <Panel title="Decisions made">
                  <BulletList items={result.decisions} />
                </Panel>
              </div>

              <Panel
                title="Risks & open questions"
                description="Unresolved items that need a follow-up."
              >
                <BulletList items={result.risks} />
                {!!result.uncertainties?.length && (
                  <div className="mt-4 rounded-lg border border-warn/25 bg-warn-soft/60 p-3.5">
                    <p className="flex items-center gap-2 text-xs font-semibold text-warn">
                      <AlertTriangle className="size-3.5" />
                      Ambiguous in your notes
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-foreground/85">
                      {result.uncertainties.map((u, i) => (
                        <li key={i}>— {u}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Panel>
            </div>
          )}
        </div>
      </div>

      <ResponsibleAi />
    </div>
  );
}
