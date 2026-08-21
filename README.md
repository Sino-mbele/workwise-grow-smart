# WorkWise AI

**Work smarter. Communicate better. Get more done.**

WorkWise AI is a polished, modern productivity SaaS that helps professionals handle everyday workplace tasks with AI. It combines five connected tools into one clean workspace: Smart Email, Meeting Intelligence, Smart Planner, Research Hub, and an AI Assistant.

Built with TanStack Start, React, TypeScript, and Tailwind CSS.

## Features

### Dashboard
A central overview showing your open tasks, recent AI activity, saved work, and AI-powered productivity insights based on your current workload.

### Smart Email Generator
Write or refine professional emails in seconds. Choose from three modes:
- **Generate** a new email from a brief
- **Improve** an existing draft
- **Retone** an existing draft in a different style

Supports tone and length controls, pulls context from your latest meeting summary, and returns a ready-to-send subject and body.

### Meeting Intelligence
Paste meeting notes or a transcript and get a structured summary with:
- Discussion points
- Decisions made
- Action items with owners, deadlines, and priority
- Risks and uncertainties

Meeting action items can be added straight to the Smart Planner, and summaries can be saved for later.

### Smart Task Planner
Build a realistic daily schedule from your open tasks. The planner respects your working hours, prioritisation style, breaks, and deep-work blocks, and warns you when the workload does not fit. Schedules can be saved as tasks.

### AI Research Hub
Research any topic with optional source text and depth controls. Returns an executive summary, key findings, important concepts, opportunities, risks, recommendations, and a non-obvious research insight.

### WorkWise AI Assistant
A general-purpose workplace AI chatbot that knows your live workspace context: your profile, open tasks, and latest meeting summary. It can answer questions, help prioritise work, prepare for meetings, and explain business concepts.

### Settings & Profile
Set your name, role, industry, working hours, preferred email tone, and prioritisation style. These details are used to personalise outputs across every AI tool.

### Saved Work
A dedicated page for saved meeting summaries, emails, research briefs, and plans, so nothing important is lost.

## Design

- Deep navy/dark blue primary palette with fresh green and soft blue accents
- Premium, modern SaaS interface with rounded cards, subtle shadows, and clean typography
- Fully responsive layout with a persistent desktop sidebar and a collapsible mobile menu
- Custom Tailwind theme using OKLCH color tokens and Google Fonts (Sora headings, Manrope body)

## AI & Backend

- All AI calls run through secure server-side functions using `createServerFn`
- Role-based system prompts for each tool (no generic prompts)
- Structured JSON outputs for emails, meetings, planner, research, and insights
- Responsible AI notices and clear loading states

## Getting Started

```sh
bun install
bun run dev
```

Open `http://localhost:8080` to use the app locally.

## Project Structure

- `src/routes/` — Application pages (Dashboard, Email, Meetings, Planner, Research, Assistant, Saved, Settings, Help)
- `src/lib/ai.functions.ts` — Server-side AI functions
- `src/lib/ai-prompts.server.ts` — Role-based system prompts
- `src/lib/ai-schemas.ts` — Zod input validation schemas
- `src/lib/workspace.tsx` — Local workspace state and context
- `src/lib/demo-data.ts` — Realistic demo data for the initial experience
- `src/components/` — Shared UI components and the app shell
- `src/styles.css` — Custom Tailwind theme and design tokens

## Demo Data

The app is pre-populated with realistic demo data for **Alex Mbele**, a Graduate / Business Analyst working in Technology & Agriculture, so first-time users can immediately explore the experience.

---

Built with Lovable.
