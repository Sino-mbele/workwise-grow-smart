import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Chip,
  CopyButton,
  EmptyState,
  PageHeader,
  Panel,
  ResponsibleAi,
} from "@/components/ui-kit";
import { useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Work — WorkWise AI" },
      {
        name: "description",
        content:
          "Everything you kept: generated emails, meeting summaries and research briefs in one library.",
      },
      { property: "og:title", content: "Saved Work — WorkWise AI" },
      {
        property: "og:description",
        content: "Your library of saved emails, summaries and research briefs.",
      },
    ],
  }),
  component: SavedPage,
});

const filters = ["All", "Email", "Meeting", "Research", "Plan"] as const;

function SavedPage() {
  const { saved, removeSaved } = useWorkspace();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const visible =
    filter === "All"
      ? saved
      : saved.filter((s) => s.kind === filter.toLowerCase());

  return (
    <div>
      <PageHeader
        eyebrow="Saved Work"
        title="Your work library"
        description="Emails, meeting summaries and research briefs you chose to keep. Everything stays on this device."
      />

      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as (typeof filters)[number])}
      >
        <TabsList className="mb-6">
          {filters.map((f) => (
            <TabsTrigger key={f} value={f} className="text-xs">
              {f}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Bookmark}
            title="Nothing saved yet"
            description="Save an email, meeting summary or research brief and it will appear here."
          />
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((item) => (
            <Panel key={item.id} className="lift">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Chip tone={item.kind === "research" ? "sky" : "growth"}>
                    {item.kind}
                  </Chip>
                  <h3 className="mt-2 text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">{item.at}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete saved item"
                  onClick={() => {
                    removeSaved(item.id);
                    toast.success("Removed from Saved Work.");
                  }}
                >
                  <Trash2 className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
              <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {item.content}
              </p>
              <div className="mt-4">
                <CopyButton text={item.content} />
              </div>
            </Panel>
          ))}
        </div>
      )}

      <ResponsibleAi />
    </div>
  );
}
