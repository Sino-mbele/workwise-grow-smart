const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export class AiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function call(messages: ChatMsg[], json: boolean) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiError(401, "AI is not configured for this workspace.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text;
    try {
      const parsed = JSON.parse(text);
      message = parsed?.error?.message ?? parsed?.message ?? text;
    } catch {
      /* keep raw text */
    }
    if (res.status === 429)
      message = "AI is busy right now (rate limited). Please try again in a moment.";
    if (res.status === 402)
      message = message || "AI credits are exhausted. Add credits to continue.";
    throw new AiError(res.status, message || `AI request failed (${res.status}).`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) throw new AiError(502, "The AI returned an empty response. Try again.");
  return content;
}

export async function aiText(system: string, user: string) {
  return call(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    false,
  );
}

export async function aiChat(messages: ChatMsg[]) {
  return call(messages, false);
}

export async function aiJson<T>(system: string, user: string): Promise<T> {
  const raw = await call(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    true,
  );
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        /* fall through */
      }
    }
    throw new AiError(502, "The AI response could not be read. Please try again.");
  }
}

export const RESPONSIBLE_AI_RULES = `Ground rules you must always follow:
- Never fabricate facts, statistics, citations, sources, names or quotes.
- Only use information the user provided or well-established general knowledge.
- If something is uncertain or missing, say so explicitly and state what you would need.
- Be concise, concrete and immediately actionable. No filler, no hype, no emoji.
- Maintain professional workplace language.`;
