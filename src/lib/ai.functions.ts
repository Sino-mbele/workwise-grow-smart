import { createServerFn } from "@tanstack/react-start";
import { aiChat, aiJson } from "./ai.server";
import {
  assistantSystem,
  emailSystem,
  insightsSystem,
  meetingSystem,
  plannerSystem,
  researchSystem,
} from "./ai-prompts.server";
import {
  chatInput,
  emailInput,
  insightsInput,
  meetingInput,
  plannerInput,
  researchInput,
} from "./ai-schemas";
import type {
  EmailResult,
  MeetingResult,
  PlanResult,
  ResearchResult,
} from "./ai-types";

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => emailInput.parse(d))
  .handler(async ({ data }): Promise<EmailResult> => {
    const task =
      data.mode === "improve"
        ? `Improve this existing draft. Keep its intent, sharpen clarity, structure and impact.\n\nDRAFT:\n${data.draft}`
        : data.mode === "retone"
          ? `Rewrite this existing draft in a ${data.tone} tone without losing any substance.\n\nDRAFT:\n${data.draft}`
          : "Write a new email from the brief below.";

    const user = `${task}

BRIEF
Recipient: ${data.recipient}
Subject / purpose: ${data.subject}
Context: ${data.context || "(none supplied)"}
Key points that must appear: ${data.keyPoints || "(none supplied)"}
Tone: ${data.tone}
Length: ${data.length}`;

    return aiJson<EmailResult>(emailSystem(data.persona), user);
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => meetingInput.parse(d))
  .handler(async ({ data }): Promise<MeetingResult> =>
    aiJson<MeetingResult>(
      meetingSystem(data.persona),
      `Analyse the following meeting notes / transcript.\n\n---\n${data.notes}\n---`,
    ),
  );

export const buildSchedule = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => plannerInput.parse(d))
  .handler(async ({ data }): Promise<PlanResult> => {
    const list = data.tasks
      .map(
        (t, i) =>
          `${i + 1}. ${t.name} | deadline: ${t.deadline} | priority: ${t.priority} | est: ${t.duration} | category: ${t.category}`,
      )
      .join("\n");
    return aiJson<PlanResult>(
      plannerSystem(data.persona),
      `Build today's schedule.\n\nWorking hours: ${data.workStart} to ${data.workEnd}\nPrioritisation style: ${data.style}\n\nTASKS\n${list}`,
    );
  });

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => researchInput.parse(d))
  .handler(async ({ data }): Promise<ResearchResult> =>
    aiJson<ResearchResult>(
      researchSystem(data.persona),
      `Research topic: ${data.topic}
Specific question: ${data.question || "(none - cover the topic broadly)"}
Requested depth: ${data.depth}
${data.source ? `\nSource text supplied by the user:\n---\n${data.source}\n---` : "\nNo source text supplied."}`,
    ),
  );

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => chatInput.parse(d))
  .handler(async ({ data }): Promise<string> =>
    aiChat([
      { role: "system", content: assistantSystem(data.persona, data.context) },
      ...data.messages,
    ]),
  );

export const productivityInsights = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => insightsInput.parse(d))
  .handler(
    async ({
      data,
    }): Promise<{
      insights: { headline: string; detail: string; type: string }[];
    }> =>
      aiJson(
        insightsSystem(data.persona),
        `Analyse this workload snapshot:\n${data.summary}`,
      ),
  );
