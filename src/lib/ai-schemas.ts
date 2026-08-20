import { z } from "zod";

export const personaSchema = z
  .object({
    name: z.string().optional(),
    role: z.string().optional(),
    industry: z.string().optional(),
  })
  .optional();

export const emailInput = z.object({
  recipient: z.string().min(1),
  subject: z.string().min(1),
  context: z.string().default(""),
  keyPoints: z.string().default(""),
  tone: z.string().default("Formal"),
  length: z.string().default("Standard"),
  mode: z.enum(["generate", "improve", "retone"]).default("generate"),
  draft: z.string().default(""),
  persona: personaSchema,
});

export const meetingInput = z.object({
  notes: z.string().min(30),
  persona: personaSchema,
});

export const plannerInput = z.object({
  tasks: z.array(
    z.object({
      name: z.string(),
      deadline: z.string(),
      priority: z.string(),
      duration: z.string(),
      category: z.string(),
    }),
  ),
  workStart: z.string().default("08:30"),
  workEnd: z.string().default("17:00"),
  style: z.string().default("Deadline first"),
  persona: personaSchema,
});

export const researchInput = z.object({
  topic: z.string().min(3),
  question: z.string().default(""),
  source: z.string().default(""),
  depth: z.string().default("Detailed Analysis"),
  persona: personaSchema,
});

export const chatInput = z.object({
  messages: z.array(
    z.object({ role: z.enum(["user", "assistant"]), content: z.string() }),
  ),
  context: z.string().default(""),
  persona: personaSchema,
});

export const insightsInput = z.object({
  summary: z.string().min(1),
  persona: personaSchema,
});
