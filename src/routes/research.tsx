import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BookMarked,
  Compass,
  ListPlus,
  Lightbulb,
  RefreshCw,
  Save,
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
import { Textarea } from "@/components/ui/textarea";
import {
  AiLoading,
  BulletList,
  Chip,
  CopyButton,
  EmptyState,
  ErrorState,
  Field,
  PageHeader,
  Panel,
  ResponsibleAi,
} from "@/components/ui-kit";
import { runResearch } from "@/lib/ai.functions";
import type { ResearchResult } from "@/lib/ai-types";
import { researchExamples } from "@/lib/demo-data";
import { usePersona, useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Hub — WorkWise AI" },
      {
        name: "description",
        content:
          "Structured research briefs with key findings, opportunities, risks, recommendations and a non-obvious research insight.",
      },
      { property: "og:title", content: "AI Research Hub — WorkWise AI" },
      {
        property: "og:description",
        content: "Structured research briefs for professionals and students.",
      },
    ],
  }),
  component: ResearchPage,
});

const depths = [
  "Quick Summary",
  "Detailed Analysis",
  "Executive Brief",
  "Beginner Explanation",
];

function toText(r: ResearchResult) {
  return [
    r.title,
    "",
    "EXECUTIVE SUMMARY",
    r.executive_summary,
    "",
    "KEY FINDINGS",
    ...r.key_findings.map((x) => `- ${x}`),
    "",
    "RESEARCH INSIGHT",
    r.research_insight,
    "",
    "OPPORTUNITIES",
    ...r.opportunities.map((x) => `- ${x}`),
    "",
    "RISKS / LIMITATIONS",
    ...r.risks.map((x) => `- ${x}`),
    "",
    "RECOMMENDATIONS",
    ...r.recommendations.map((x) => `- ${x}`),
    "",
    "QUESTIONS FOR FURTHER RESEARCH",
    ...r.further_questions.map((x) => `- ${x}`),
    "",
    `CONFIDENCE: ${r.confidence}`,
  ].join("\n");
}

function ResearchPage() {
  const persona = usePersona();
  const { addTasks, logActivity, save } = useWorkspace();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [source, setSource] = useState("");
  const [depth, setDepth] = useState("Detailed Analysis");

  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    if (topic.trim().length < 3) {
      toast.error("Enter a research topic first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await runResearch({
        data: { topic, question, source, depth, persona },
      });
      setResult(res);
      logActivity({
        kind: "research",
        title: "Research completed",
        detail: res.title,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const toPlanner = () => {
    if (!result?.recommendations.length) return;
    addTasks(
      result.recommendations.slice(0, 5).map((r) => ({
        name: r,
        deadline: "This week",
        priority: "Medium" as const,
        duration: "1h",
        category: "Research",
        source: result.title,
      })),
    );
    toast.success("Recommendations added to Smart Planner.", {
      action: {
        label: "Open planner",
        onClick: () => void navigate({ to: "/planner" }),
      },
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Research Hub"
        title="Research that ends in a decision"
        description="Explore a topic, analyse a document, or brief a stakeholder — with findings, implications and an insight that goes beyond the summary."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {researchExamples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setTopic(ex);
              toast.success("Topic loaded.");
            }}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-sky/40 hover:bg-sky-soft hover:text-sky"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Panel title="Research brief">
          <div className="space-y-4">
            <Field label="Research topic">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. How AI is transforming workplace productivity"
              />
            </Field>
            <Field label="Specific question" hint="Optional but sharpens the output.">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What should a 40-person team adopt first?"
              />
            </Field>
            <Field
              label="Source text"
              hint="Optional — paste an article, report extract or notes to ground the analysis."
            >
              <Textarea
                rows={8}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Paste source material here..."
              />
            </Field>
            <Field label="Depth">
              <Select value={depth} onValueChange={setDepth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {depths.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Button className="w-full" onClick={run} disabled={loading}>
              <Wand2 className="size-4" />
              {loading ? "Researching..." : "Run research"}
            </Button>
          </div>
        </Panel>

        <div className="space-y-4">
          {loading && <AiLoading message="Extracting key insights..." />}
          {!loading && error && <ErrorState message={error} onRetry={run} />}
          {!loading && !error && !result && (
            <Panel>
              <EmptyState
                icon={Compass}
                title="No research yet"
                description="Pick a suggested topic or write your own, choose a depth, then run the analysis."
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
                    <CopyButton text={toText(result)} />
                    <Button variant="outline" size="sm" onClick={run}>
                      <RefreshCw className="size-3.5" />
                      Regenerate
                    </Button>
                  </>
                }
              >
                <p className="text-sm leading-relaxed text-foreground/90">
                  {result.executive_summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip tone="sky">{depth}</Chip>
                  <Chip tone="growth">
                    {result.key_findings.length} key findings
                  </Chip>
                  {source && <Chip>Grounded in your source</Chip>}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      save({
                        kind: "research",
                        title: result.title,
                        content: toText(result),
                      });
                      toast.success("Saved to Saved Work.");
                    }}
                  >
                    <Save className="size-3.5" />
                    Save brief
                  </Button>
                  <Button variant="outline" size="sm" onClick={toPlanner}>
                    <ListPlus className="size-3.5" />
                    Recommendations to planner
                  </Button>
                </div>
              </Panel>

              <div className="rounded-xl border border-growth/25 bg-growth-soft/50 p-5">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-growth">
                  <Lightbulb className="size-3.5" />
                  Research insight
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-foreground/90">
                  {result.research_insight}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Panel title="Key findings">
                  <BulletList items={result.key_findings} />
                </Panel>
                <Panel title="Important concepts">
                  <dl className="space-y-3">
                    {result.important_concepts?.map((c, i) => (
                      <div key={i}>
                        <dt className="text-sm font-semibold text-foreground">
                          {c.term}
                        </dt>
                        <dd className="text-sm leading-relaxed text-muted-foreground">
                          {c.explanation}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Panel>
                <Panel title="Opportunities">
                  <BulletList items={result.opportunities} />
                </Panel>
                <Panel title="Risks & limitations">
                  <BulletList items={result.risks} />
                </Panel>
                <Panel title="Practical recommendations">
                  <BulletList items={result.recommendations} />
                </Panel>
                <Panel title="Questions for further research">
                  <BulletList items={result.further_questions} />
                </Panel>
              </div>

              <Panel title="Confidence & verification">
                <p className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                  <BookMarked className="mt-0.5 size-4 shrink-0 text-sky" />
                  {result.confidence}
                </p>
              </Panel>
            </div>
          )}
        </div>
      </div>

      <ResponsibleAi variant="research" />
    </div>
  );
}
