import { createFileRoute } from "@tanstack/react-router";
import { Mail, RefreshCw, Save, Sparkles, Wand2 } from "lucide-react";
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
  Chip,
  CopyButton,
  EmptyState,
  ErrorState,
  Field,
  PageHeader,
  Panel,
  ResponsibleAi,
} from "@/components/ui-kit";
import { generateEmail } from "@/lib/ai.functions";
import type { EmailResult } from "@/lib/ai-types";
import { emailExamples } from "@/lib/demo-data";
import { usePersona, useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkWise AI" },
      {
        name: "description",
        content:
          "Draft professional workplace emails with structured briefs, tone control and one-click improvement.",
      },
      { property: "og:title", content: "Smart Email Generator — WorkWise AI" },
      {
        property: "og:description",
        content: "Structured, tone-controlled professional email drafting.",
      },
    ],
  }),
  component: EmailPage,
});

const tones = ["Formal", "Friendly", "Persuasive", "Concise"];
const lengths = ["Short", "Standard", "Detailed"];

function EmailPage() {
  const persona = usePersona();
  const { profile, logActivity, save, lastMeeting } = useWorkspace();

  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState(profile.tone);
  const [length, setLength] = useState("Standard");

  const [result, setResult] = useState<EmailResult | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Drafting your email...");
  const [error, setError] = useState("");

  const run = async (
    mode: "generate" | "improve" | "retone",
    nextTone = tone,
  ) => {
    if (!recipient.trim() || !subject.trim()) {
      toast.error("Add a recipient and a subject or purpose first.");
      return;
    }
    if (mode !== "generate" && !draft.trim()) {
      toast.error("Generate a draft before improving it.");
      return;
    }
    setLoading(true);
    setError("");
    setLoadingMsg(
      mode === "improve"
        ? "Sharpening your draft..."
        : mode === "retone"
          ? `Rewriting in a ${nextTone.toLowerCase()} tone...`
          : "Drafting your email...",
    );
    try {
      const res = await generateEmail({
        data: {
          recipient,
          subject,
          context,
          keyPoints,
          tone: nextTone,
          length,
          mode,
          draft,
          persona,
        },
      });
      setResult(res);
      setDraft(res.body);
      logActivity({
        kind: "email",
        title: "Email generated",
        detail: res.subject,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const applyExample = (ex: (typeof emailExamples)[number]) => {
    setRecipient(ex.recipient);
    setSubject(ex.subject);
    setContext(ex.context);
    setKeyPoints(ex.keyPoints);
    setTone(ex.tone);
    toast.success(`Loaded example: ${ex.label}`);
  };

  const fromMeeting = () => {
    if (!lastMeeting) {
      toast.error("Summarise a meeting first — then follow up from its decisions.");
      return;
    }
    setSubject(`Follow-up: ${lastMeeting.title}`);
    setContext(lastMeeting.summary);
    setKeyPoints(
      [
        ...lastMeeting.decisions.map((d) => `Decision: ${d}`),
        ...lastMeeting.action_items.map(
          (a) => `${a.task} — ${a.owner}, due ${a.deadline}`,
        ),
      ].join("\n"),
    );
    toast.success("Pulled context from your latest meeting summary.");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Smart Email"
        title="Professional email workspace"
        description="Give WorkWise AI a structured brief and get a send-ready email that matches your tone, context and intent."
        actions={
          <Button variant="outline" size="sm" onClick={fromMeeting}>
            <Sparkles className="size-3.5" />
            From last meeting
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {emailExamples.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => applyExample(ex)}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-growth/40 hover:bg-growth-soft hover:text-growth"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Panel title="Brief" description="The more context you give, the better the draft.">
          <div className="space-y-4">
            <Field label="Recipient">
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Sarah Petersen, Programme Manager"
              />
            </Field>
            <Field label="Subject / purpose">
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Weekly status on the Q3 proposal"
              />
            </Field>
            <Field label="Context" hint="Background the recipient needs.">
              <Textarea
                rows={4}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="What happened before this email?"
              />
            </Field>
            <Field label="Key points" hint="One per line — all of these will appear.">
              <Textarea
                rows={4}
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="Status update&#10;Pricing blocker&#10;Revised delivery date"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tone">
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Length">
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lengths.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Button
              className="w-full"
              onClick={() => run("generate")}
              disabled={loading}
            >
              <Wand2 className="size-4" />
              {loading ? "Generating..." : "Generate email"}
            </Button>
          </div>
        </Panel>

        <div className="space-y-4">
          {loading && <AiLoading message={loadingMsg} />}
          {!loading && error && (
            <ErrorState message={error} onRetry={() => run("generate")} />
          )}
          {!loading && !error && !result && (
            <Panel>
              <EmptyState
                icon={Mail}
                title="No draft yet"
                description="Fill in the brief or load one of the examples above, then generate your email."
              />
            </Panel>
          )}
          {!loading && result && (
            <Panel
              title="Generated email"
              description={result.notes}
              className="rise"
              actions={<CopyButton text={`Subject: ${result.subject}\n\n${draft}`} />}
            >
              <div className="mb-4 rounded-lg bg-surface px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Subject
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {result.subject}
                </p>
              </div>
              <Textarea
                rows={16}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="font-sans text-sm leading-relaxed"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => run("generate")}
                  disabled={loading}
                >
                  <RefreshCw className="size-3.5" />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => run("improve")}
                  disabled={loading}
                >
                  <Sparkles className="size-3.5" />
                  Improve
                </Button>
                <Select
                  value={tone}
                  onValueChange={(v) => {
                    setTone(v);
                    void run("retone", v);
                  }}
                >
                  <SelectTrigger className="h-8 w-[150px] text-xs">
                    <SelectValue placeholder="Change tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t} value={t}>
                        Change tone: {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    save({
                      kind: "email",
                      title: result.subject,
                      content: draft,
                    });
                    toast.success("Saved to Saved Work.");
                  }}
                >
                  <Save className="size-3.5" />
                  Save
                </Button>
                <Chip tone="sky">{tone}</Chip>
              </div>
            </Panel>
          )}
        </div>
      </div>

      <ResponsibleAi />
    </div>
  );
}
