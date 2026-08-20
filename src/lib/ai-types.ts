export type Priority = "High" | "Medium" | "Low";

export type EmailResult = {
  subject: string;
  body: string;
  notes?: string;
};

export type ActionItem = {
  task: string;
  owner: string;
  deadline: string;
  priority: Priority | string;
};

export type MeetingResult = {
  title: string;
  summary: string;
  discussion_points: string[];
  decisions: string[];
  action_items: ActionItem[];
  risks: string[];
  uncertainties?: string[];
};

export type PlannedTask = {
  task: string;
  priority: Priority | string;
  deadline: string;
  estimated_duration: string;
  scheduled_time: string;
  category?: string;
  reason: string;
};

export type PlanResult = {
  strategy: string;
  blocks: PlannedTask[];
  breaks: { time: string; note: string }[];
  insights: string[];
  total_planned: string;
};

export type ResearchResult = {
  title: string;
  executive_summary: string;
  key_findings: string[];
  important_concepts: { term: string; explanation: string }[];
  opportunities: string[];
  risks: string[];
  recommendations: string[];
  further_questions: string[];
  research_insight: string;
  confidence: string;
};

export type Task = {
  id: string;
  name: string;
  deadline: string;
  priority: Priority;
  duration: string;
  category: string;
  completed: boolean;
  source?: string;
};

export type ActivityItem = {
  id: string;
  kind: "email" | "meeting" | "planner" | "research" | "chat";
  title: string;
  detail: string;
  at: string;
};

export type SavedItem = {
  id: string;
  kind: "email" | "meeting" | "research" | "plan";
  title: string;
  content: string;
  at: string;
};

export type Profile = {
  name: string;
  role: string;
  industry: string;
  tone: string;
  workStart: string;
  workEnd: string;
  prioritStyle: string;
};
