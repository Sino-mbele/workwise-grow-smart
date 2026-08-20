import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, Bot, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Chip,
  CopyButton,
  ErrorState,
  PageHeader,
  Panel,
  ResponsibleAi,
} from "@/components/ui-kit";
import { askAssistant } from "@/lib/ai.functions";
import { chatSuggestions } from "@/lib/demo-data";
import {
  usePersona,
  useWorkspace,
  useWorkspaceContextText,
} from "@/lib/workspace";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — WorkWise AI" },
      {
        name: "description",
        content:
          "A workplace thinking partner that knows your tasks and meetings: prioritise, brainstorm, prepare and communicate.",
      },
      { property: "og:title", content: "AI Assistant — WorkWise AI" },
      {
        property: "og:description",
        content: "A workplace assistant with context from your tasks and meetings.",
      },
    ],
  }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function AssistantPage() {
  const persona = usePersona();
  const context = useWorkspaceContextText();
  const { tasks, lastMeeting, logActivity } = useWorkspace();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content) {
      toast.error("Type a message first.");
      return;
    }
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const reply = await askAssistant({
        data: { messages: next, context, persona },
      });
      setMessages([...next, { role: "assistant", content: reply }]);
      logActivity({
        kind: "chat",
        title: "Assistant consulted",
        detail: content.slice(0, 70),
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
        eyebrow="AI Assistant"
        title="Your workplace thinking partner"
        description="Connected to your live workspace — it can see your open tasks and your latest meeting summary."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
        <Panel className="flex h-[34rem] flex-col p-0 sm:h-[38rem] sm:p-0">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && !loading && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="grid size-12 place-items-center rounded-2xl gradient-growth text-growth-foreground">
                  <Sparkles className="size-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  Ask WorkWise AI anything about your work
                </p>
                <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                  Brainstorming, prioritisation, meeting prep, workplace
                  communication, research questions and career growth.
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 rise ${m.role === "user" ? "justify-end" : ""}`}
              >
                {m.role === "assistant" && (
                  <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Bot className="size-3.5" />
                  </span>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-foreground"
                  }`}
                >
                  {m.content}
                  {m.role === "assistant" && (
                    <div className="mt-3">
                      <CopyButton text={m.content} />
                    </div>
                  )}
                </div>
                {m.role === "user" && (
                  <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                    <User className="size-3.5" />
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Bot className="size-3.5" />
                </span>
                <div className="rounded-2xl bg-surface px-4 py-3">
                  <span className="flex gap-1.5">
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                  </span>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Thinking it through...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <ErrorState
                message={error}
                onRetry={() => {
                  const last = [...messages].reverse().find((m) => m.role === "user");
                  if (last) {
                    setMessages(messages.filter((m) => m !== last));
                    void send(last.content);
                  }
                }}
              />
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-4">
            <div className="flex items-end gap-2">
              <Textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder="Ask about your workload, a message you need to send, or an idea..."
                className="max-h-32 min-h-11 resize-none text-sm"
              />
              <Button
                size="icon"
                aria-label="Send message"
                onClick={() => void send(input)}
                disabled={loading}
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Suggested prompts">
            <div className="space-y-2">
              {chatSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  disabled={loading}
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-left text-sm text-foreground transition-all hover:border-growth/40 hover:bg-growth-soft/50 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </Panel>

          <Panel
            title="Workspace context"
            description="What the assistant can see right now."
          >
            <div className="flex flex-wrap gap-2">
              <Chip tone="growth">
                {tasks.filter((t) => !t.completed).length} open tasks
              </Chip>
              <Chip tone="sky">
                {lastMeeting ? "Latest meeting summary" : "No meeting loaded"}
              </Chip>
              <Chip>{persona.role}</Chip>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Context is assembled from your planner and meeting summaries so
              answers reference your actual work — nothing is invented.
            </p>
          </Panel>
        </div>
      </div>

      <ResponsibleAi />
    </div>
  );
}
