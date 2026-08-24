export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type SparkCard = {
  id: string;
  title: string;
  time: string;
  emotion: string;
  insight: string;
  /** Which chapter / era this card belongs to */
  chapter?: string;
  /** Stream-injected live card fields */
  time_anchor?: string | null;
  fact_summary?: string | null;
  emotional_peak?: string | null;
  inner_insight?: string | null;
  keywords?: string[];
  /** Raw event description from the card */
  event?: string | null;
};

export type StoryChapter = {
  chapter: string;
  summary: string;
  sparkIds: string[];
  highlight: string;
};

export type Story = {
  title: string;
  subtitle: string;
  tone: string;
  chapters: StoryChapter[];
  closing: string;
};