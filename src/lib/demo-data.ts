import type { ActivityItem, Profile, SavedItem, Task } from "./ai-types";

export const defaultProfile: Profile = {
  name: "Alex Mbele",
  role: "Graduate / Business Analyst",
  industry: "Technology & Agriculture",
  tone: "Formal",
  workStart: "08:30",
  workEnd: "17:00",
  prioritStyle: "Deadline first",
};

export const demoTasks: Task[] = [
  {
    id: "t1",
    name: "Complete Q3 client project proposal",
    deadline: "Tomorrow",
    priority: "High",
    duration: "2h 30m",
    category: "Client Work",
    completed: false,
  },
  {
    id: "t2",
    name: "Review Northgate meeting notes and circulate actions",
    deadline: "Today",
    priority: "High",
    duration: "45m",
    category: "Meetings",
    completed: false,
  },
  {
    id: "t3",
    name: "Submit market research brief to Thandi",
    deadline: "Today",
    priority: "High",
    duration: "1h",
    category: "Research",
    completed: false,
  },
  {
    id: "t4",
    name: "Draft follow-up email to Meridian Logistics",
    deadline: "Today",
    priority: "Medium",
    duration: "20m",
    category: "Communication",
    completed: false,
  },
  {
    id: "t5",
    name: "Build supply-chain data model v2",
    deadline: "Friday",
    priority: "Medium",
    duration: "3h",
    category: "Analysis",
    completed: false,
  },
  {
    id: "t6",
    name: "Prepare slides for Monday team presentation",
    deadline: "Monday",
    priority: "Medium",
    duration: "1h 30m",
    category: "Presentation",
    completed: false,
  },
  {
    id: "t7",
    name: "Complete Data Storytelling course module 4",
    deadline: "Next week",
    priority: "Low",
    duration: "50m",
    category: "Career Growth",
    completed: false,
  },
  {
    id: "t8",
    name: "Update stakeholder register",
    deadline: "Yesterday",
    priority: "Low",
    duration: "25m",
    category: "Project Management",
    completed: true,
  },
];

export const demoActivity: ActivityItem[] = [
  {
    id: "a1",
    kind: "email",
    title: "Email generated",
    detail: "Follow-up to Meridian Logistics after discovery call",
    at: "18 minutes ago",
  },
  {
    id: "a2",
    kind: "meeting",
    title: "Meeting summarised",
    detail: "Northgate weekly sync — 6 action items extracted",
    at: "1 hour ago",
  },
  {
    id: "a3",
    kind: "planner",
    title: "Schedule created",
    detail: "7.5 hours planned across 5 focus blocks",
    at: "Today, 08:34",
  },
  {
    id: "a4",
    kind: "research",
    title: "Research completed",
    detail: "Automation trends in mid-market operations",
    at: "Yesterday, 16:12",
  },
];

export const demoSaved: SavedItem[] = [
  {
    id: "s1",
    kind: "meeting",
    title: "Northgate weekly sync — summary",
    content:
      "Executive summary: the team confirmed the Q3 scope, agreed to move the pilot to the Cape Town site, and flagged a data-quality risk in the reporting pipeline. Six action items were assigned with owners and deadlines.",
    at: "Today, 09:12",
  },
  {
    id: "s2",
    kind: "email",
    title: "Follow-up — Meridian Logistics discovery call",
    content:
      "Hi Nomsa,\n\nThank you for your time this morning. To recap: your priority is reducing manual reconciliation across the depot network, with a decision expected by month end.\n\nI'll send the scoped proposal on Thursday.\n\nKind regards,\nAlex",
    at: "Today, 08:51",
  },
  {
    id: "s3",
    kind: "research",
    title: "How AI is transforming workplace productivity",
    content:
      "Executive brief covering adoption patterns, measurable productivity gains, governance risks and a recommended phased rollout for mid-market teams.",
    at: "Yesterday, 16:12",
  },
];

export const emailExamples = [
  {
    label: "Follow up after a meeting",
    recipient: "Nomsa Dlamini, Operations Director at Meridian Logistics",
    subject: "Follow-up and next steps after today's discovery call",
    context:
      "We met this morning to discuss manual reconciliation across their 12 depots. They want a decision before month end.",
    keyPoints:
      "Thank her for the time; recap the three pain points; confirm I will send a scoped proposal on Thursday; ask who else should review it.",
    tone: "Formal",
  },
  {
    label: "Request information",
    recipient: "Thandi Nkosi, Data Governance Lead",
    subject: "Request for Q2 supply-chain dataset access",
    context:
      "I am building a supply-chain data model and need read access to the Q2 warehouse dataset.",
    keyPoints:
      "Explain what the model is for; specify the exact dataset and date range; commit to the governance policy; ask what approval is needed.",
    tone: "Concise",
  },
  {
    label: "Apply for an opportunity",
    recipient: "Hiring Manager, Insight Analytics Graduate Programme",
    subject: "Application — Business Analyst Graduate Programme",
    context:
      "Graduate business analyst with a background in data, business and applied technology projects.",
    keyPoints:
      "Show genuine interest in the programme; highlight analytics and stakeholder experience; reference the attached CV; request a conversation.",
    tone: "Persuasive",
  },
  {
    label: "Update your manager",
    recipient: "Sarah Petersen, Programme Manager",
    subject: "Weekly status — Q3 client proposal",
    context:
      "Proposal is 70% complete, blocked on pricing sign-off from finance.",
    keyPoints:
      "State current status; flag the pricing blocker; give the revised delivery date; state what I need from her.",
    tone: "Concise",
  },
  {
    label: "Client communication",
    recipient: "David Chen, Head of Innovation at Northgate",
    subject: "Pilot timeline update and revised milestones",
    context:
      "The pilot site moved to Cape Town, shifting the timeline by two weeks.",
    keyPoints:
      "Explain the change and why; give revised milestone dates; reassure on scope and budget; offer a short call.",
    tone: "Friendly",
  },
];

export const sampleMeetingNotes = `Northgate Weekly Sync — Tuesday, attendees: Alex, Sarah, David, Thandi, Priya

- David opened by saying the board wants the operational pilot live before the end of the quarter. Pressure is real but the scope is not changing.
- Sarah walked through the proposal status. It is roughly 70% done. She is waiting on finance to sign off pricing, which has been outstanding for four days.
- Discussion about the pilot site. Johannesburg depot has connectivity problems, so the team agreed to move the pilot to Cape Town instead. This pushes the timeline out by about two weeks.
- Thandi raised a data-quality issue: about 12% of the reporting pipeline records have missing timestamps. She does not yet know the root cause. This could distort the pilot metrics.
- Priya asked whether we should tell the client about the delay now or wait until the revised plan is confirmed. Team agreed to tell them now, proactively.
- Alex to prepare the revised milestone plan and a client-facing update.
- Sarah will chase finance and finalise the proposal by Friday.
- Thandi will investigate the timestamp issue and report back at next week's sync.
- David will brief the board on Thursday.
- Open question: do we need extra budget for the Cape Town site setup? Nobody could answer.
- Priya mentioned the team presentation is on Monday and asked who is presenting. Not decided.`;

export const researchExamples = [
  "How AI is transforming workplace productivity",
  "What makes a data governance programme succeed in mid-market companies",
  "Sustainable supply-chain practices that reduce operating cost",
  "Career paths from business analyst to product manager",
];

export const chatSuggestions = [
  "Help me prepare for tomorrow's meeting",
  "Turn these notes into an action plan",
  "Help me prioritise my workload",
  "Explain this business concept",
  "Help me write a professional response",
  "Give me ideas for improving team productivity",
];
