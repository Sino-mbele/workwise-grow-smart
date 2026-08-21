import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
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
import {
  Chip,
  Field,
  PageHeader,
  Panel,
  ResponsibleAi,
} from "@/components/ui-kit";
import type { Profile } from "@/lib/ai-types";
import { useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WorkWise AI" },
      {
        name: "description",
        content:
          "Personalise WorkWise AI: your name, role, industry, preferred email tone, working hours and prioritisation style.",
      },
      { property: "og:title", content: "Settings — WorkWise AI" },
      {
        property: "og:description",
        content: "Personalise how WorkWise AI writes, plans and prioritises for you.",
      },
    ],
  }),
  component: SettingsPage,
});

const tones = ["Formal", "Friendly", "Persuasive", "Concise"];
const styles = [
  "Deadline first",
  "Impact first",
  "Quick wins first",
  "Deep work first",
];

function SettingsPage() {
  const { profile, setProfile, reset, hydrated } = useWorkspace();
  const [form, setForm] = useState<Profile>(profile);

  useEffect(() => {
    if (hydrated) setForm(profile);
  }, [hydrated, profile]);

  const update = (patch: Partial<Profile>) =>
    setForm((f) => ({ ...f, ...patch }));

  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Personalisation"
        description="WorkWise AI uses this profile in every prompt, so drafts, plans and research match your role and context."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              reset();
              toast.success("Workspace reset to the demo data.");
            }}
          >
            <RotateCcw className="size-3.5" />
            Reset demo data
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Panel title="Profile" description="Who WorkWise AI is writing for.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </Field>
            <Field label="Role">
              <Input
                value={form.role}
                onChange={(e) => update({ role: e.target.value })}
                placeholder="e.g. Graduate / Business Analyst"
              />
            </Field>
            <Field label="Industry">
              <Input
                value={form.industry}
                onChange={(e) => update({ industry: e.target.value })}
                placeholder="e.g. Technology & Agriculture"
              />
            </Field>
            <Field label="Preferred email tone">
              <Select
                value={form.tone}
                onValueChange={(v) => update({ tone: v })}
              >
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
            <Field label="Working hours start">
              <Input
                type="time"
                value={form.workStart}
                onChange={(e) => update({ workStart: e.target.value })}
              />
            </Field>
            <Field label="Working hours end">
              <Input
                type="time"
                value={form.workEnd}
                onChange={(e) => update({ workEnd: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field
                label="Default prioritisation style"
                hint="Shapes how the Smart Planner orders your day."
              >
                <Select
                  value={form.prioritStyle}
                  onValueChange={(v) => update({ prioritStyle: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
          <Button
            className="mt-5"
            onClick={() => {
              if (!form.name.trim()) {
                toast.error("Your name can't be empty.");
                return;
              }
              setProfile(form);
              toast.success("Preferences saved.");
            }}
          >
            <Save className="size-4" />
            Save preferences
          </Button>
        </Panel>

        <div className="space-y-6">
          <Panel
            title="How personalisation is used"
            description="Every feature receives this profile."
          >
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Smart Email</span> —
                matches your default tone and writes at your seniority level.
              </li>
              <li>
                <span className="font-medium text-foreground">Smart Planner</span>{" "}
                — schedules only inside your working hours using your
                prioritisation style.
              </li>
              <li>
                <span className="font-medium text-foreground">Research Hub</span> —
                frames findings for your industry and role.
              </li>
              <li>
                <span className="font-medium text-foreground">AI Assistant</span> —
                references your open tasks and latest meeting summary.
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip tone="growth">{form.role || "Role not set"}</Chip>
              <Chip tone="sky">{form.industry || "Industry not set"}</Chip>
              <Chip>
                {form.workStart}–{form.workEnd}
              </Chip>
            </div>
          </Panel>

          <Panel title="Data & privacy">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your profile, tasks and saved work stay in this browser. Prompts are
              sent to the AI provider through a secure server function — no API
              keys are ever exposed to the browser.
            </p>
          </Panel>
        </div>
      </div>

      <ResponsibleAi />
    </div>
  );
}
