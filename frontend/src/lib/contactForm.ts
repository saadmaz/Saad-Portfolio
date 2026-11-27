/** Topics on the contact form; `kind` decides which follow-up questions show. */
export const TOPICS = [
  { id: "build", label: "Product development", kind: "build" },
  { id: "ai", label: "AI & automation", kind: "build" },
  { id: "startup", label: "Startup collaboration", kind: "other" },
  { id: "speaking", label: "Speaking / hosting", kind: "event" },
  { id: "consulting", label: "Consulting", kind: "other" },
  { id: "other", label: "Something else", kind: "other" },
] as const;

export type Topic = (typeof TOPICS)[number];
export type TopicId = Topic["id"];

/** Old ?topic= values still linked from other pages. */
const TOPIC_ALIASES: Record<string, TopicId> = { hosting: "speaking" };

export const BUDGETS = [
  "Under $1,000",
  "$1,000–$2,000",
  "$2,000–$5,000",
  "$5,000–$10,000",
  "$10,000+",
  "Not sure yet",
];
export const TIMELINES = ["ASAP", "1–3 months", "3+ months", "Flexible"];
/** Leaves room under the API's 5000-character cap for the details header. */
export const MESSAGE_MAX = 4500;

/** "?topic=speaking" → the Speaking topic; unknown or missing → the first one. */
export function topicFromQuery(search: string): Topic {
  const raw = new URLSearchParams(search).get("topic")?.toLowerCase() ?? "";
  const id = TOPIC_ALIASES[raw] ?? raw;
  return TOPICS.find((t) => t.id === id) ?? TOPICS[0];
}

export interface ContactDetails {
  topic: Topic;
  company?: string;
  budget?: string;
  timeline?: string;
  eventDate?: string;
  audience?: string;
  message: string;
}

/**
 * The API only takes a subject and a message, so the optional answers
 * travel as a short header above the visitor's own words.
 */
export function composeMessage(d: ContactDetails): { subject: string; message: string } {
  const company = d.company?.trim();
  const lines = [
    company && `Company: ${company}`,
    ...(d.topic.kind === "build"
      ? [d.budget && `Budget: ${d.budget}`, d.timeline && `Timeline: ${d.timeline}`]
      : d.topic.kind === "event"
        ? [
            d.eventDate?.trim() && `Event date: ${d.eventDate.trim()}`,
            d.audience?.trim() && `Audience: ${d.audience.trim()}`,
          ]
        : []),
  ];
  const header = lines.filter(Boolean).join("\n");
  const subject = [d.topic.label, d.topic.kind === "build" ? d.budget : d.eventDate?.trim()]
    .filter(Boolean)
    .join(" · ");
  return { subject, message: header ? `${header}\n\n${d.message.trim()}` : d.message.trim() };
}
