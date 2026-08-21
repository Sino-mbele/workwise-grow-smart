import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpenCheck,
  CalendarRange,
  Mail,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader, Panel, ResponsibleAi } from "@/components/ui-kit";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Responsible AI — WorkWise AI" },
      {
        name: "description",
        content:
          "How each WorkWise AI tool works, how the features connect, and how to use AI output responsibly at work.",
      },
      { property: "og:title", content: "Help & Responsible AI — WorkWise AI" },
      {
        property: "og:description",
        content: "Guides for every tool plus our responsible AI principles.",
      },
    ],
  }),
  component: HelpPage,
});

const tools = [
  {
    to: "/email",
    icon: Mail,
    name: "Smart Email",
    body: "Turn a structured brief into a send-ready email. Change tone, improve the draft, or pull context straight from your last meeting summary.",
  },
  {
    to: "/meetings",
    icon: BookOpenCheck,
    name: "Meeting Intelligence",
    body: "Paste notes or a transcript to get an executive summary, decisions, an owned action-item table and open risks. Push actions into the planner in one click.",
  },
  {
    to: "/planner",
    icon: CalendarRange,
    name: "Smart Planner",
    body: "Capture tasks manually or from other tools, then generate a realistic schedule with time blocks, breaks and the reasoning behind each priority.",
  },
  {
    to: "/research",
    icon: Sparkles,
    name: "Research Hub",
    body: "Four depths of analysis, grounded in your source text when you supply one, ending with a non-obvious research insight and next questions.",
  },
  {
    to: "/assistant",
    icon: MessagesSquare,
    name: "AI Assistant",
    body: "A thinking partner with access to your open tasks and latest meeting summary — for prep, prioritisation, communication and career questions.",
  },
] as const;

function HelpPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Help"
        title="How WorkWise AI works"
        description="Five connected tools, one workspace. Everything you produce in one tool can feed the next."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((t) => (
          <Link key={t.to} to={t.to} className="surface-card lift block p-5">
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
              <t.icon className="size-4" />
            </span>
            <h2 className="mt-3 text-sm font-semibold text-foreground">{t.name}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t.body}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Panel title="Frequently asked questions">
          <Accordion type="single" collapsible>
            <AccordionItem value="a">
              <AccordionTrigger>How do the tools connect?</AccordionTrigger>
              <AccordionContent>
                Meeting action items can be added straight to the Smart Planner.
                Research recommendations can become planner tasks. Smart Email can
                pull context from your most recent meeting summary, and the AI
                Assistant reads your open tasks and latest meeting so its advice
                references real work.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Where is my data stored?</AccordionTrigger>
              <AccordionContent>
                Tasks, saved work and your profile stay in this browser. AI
                requests run through a secure server function, so no API key is
                ever present in frontend code.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="c">
              <AccordionTrigger>Why does each feature answer differently?</AccordionTrigger>
              <AccordionContent>
                Every feature has its own role-based system prompt and its own
                structured output schema — an email editor, a chief-of-staff
                analyst, a scheduling strategist and a research partner. There is
                no single generic prompt behind the product.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="d">
              <AccordionTrigger>Can I trust the output?</AccordionTrigger>
              <AccordionContent>
                Treat it as a strong first draft. The models are instructed never
                to fabricate sources, dates or figures and to flag uncertainty,
                but you remain responsible for verifying anything that carries
                professional, financial, legal or academic weight.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Panel>

        <Panel title="Responsible AI principles">
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              "No fabricated sources, statistics, names or citations.",
              "Uncertainty is stated explicitly rather than smoothed over.",
              "Owners and deadlines are only taken from what you provided.",
              "Research output is a support for verification, not a replacement.",
              "You always keep editorial control before anything is sent.",
            ].map((p) => (
              <li key={p} className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-growth" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <ResponsibleAi />
    </div>
  );
}
