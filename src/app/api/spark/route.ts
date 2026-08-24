import { deepseekChat } from "@/lib/deepseek";
import { SPARK_EXTRACT_PROMPT } from "@/lib/prompts";
import { NextResponse } from "next/server";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: IncomingMessage[] };

    const messages = (body.messages ?? []).slice(-8);

    if (messages.length < 2) {
      return NextResponse.json({ skip: true });
    }

    const response = await deepseekChat({
      messages: [
        { role: "system", content: SPARK_EXTRACT_PROMPT },
        {
          role: "user",
          content: `请根据以下对话判断是否生成人生火花卡片：\n\n${messages
            .map((item) => `${item.role === "user" ? "用户" : "朋友"}：${item.content}`)
            .join("\n")}`,
        },
      ],
    });

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(content);

    if (!parsed || parsed.skip === true) {
      return NextResponse.json({ skip: true });
    }

    const rawCard = parsed.card_data ?? parsed;
    const event = rawCard.event != null ? String(rawCard.event).trim() : null;
    const title = String(rawCard.title ?? "").trim();
    const emotion = String(rawCard.emotion ?? "").trim();
    const insight = String(rawCard.insight ?? rawCard.inner_insight ?? "").trim();
    const timeAnchor = rawCard.time_anchor != null ? String(rawCard.time_anchor).trim() : null;
    const factSummary = rawCard.fact_summary != null ? String(rawCard.fact_summary).trim() : null;
    const emotionalPeak = rawCard.emotional_peak != null ? String(rawCard.emotional_peak).trim() : null;
    const innerInsight = rawCard.inner_insight != null ? String(rawCard.inner_insight).trim() : null;
    const keywords = Array.isArray(rawCard.keywords)
      ? rawCard.keywords.map((k: unknown) => String(k ?? "")).filter(Boolean)
      : undefined;

    if (!title || !emotion) {
      return NextResponse.json({ skip: true });
    }

    return NextResponse.json({
      card: {
        title,
        emotion,
        insight,
        time: new Date().toISOString(),
        event,
        time_anchor: timeAnchor,
        fact_summary: factSummary,
        emotional_peak: emotionalPeak,
        inner_insight: innerInsight,
        keywords,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "卡片提炼失败。";
    return NextResponse.json({ error: message, skip: true }, { status: 500 });
  }
}