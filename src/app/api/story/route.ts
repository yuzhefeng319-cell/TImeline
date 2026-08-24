import { deepseekChat } from "@/lib/deepseek";
import { STORY_BUILDER_PROMPT } from "@/lib/prompts";
import { NextResponse } from "next/server";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

type IncomingSpark = {
  id: string;
  title: string;
  emotion: string;
  insight: string;
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

export type StoryChapter = {
  chapter: string;
  summary: string;
  sparkIds: string[];
  highlight: string;
};

export type StoryPayload = {
  title: string;
  subtitle: string;
  tone: string;
  chapters: StoryChapter[];
  closing: string;
};

function buildPayload(parsed: Record<string, unknown>, sparks: IncomingSpark[]) {
  const chaptersIn = Array.isArray(parsed.chapters) ? parsed.chapters : [];
  const validSparkIds = new Set(sparks.map((card) => card.id));
  const chapters: StoryChapter[] = chaptersIn
    .map((raw) => {
      const item = raw as Record<string, unknown>;
      const chapter = String(item.chapter ?? "").trim();
      const summary = String(item.summary ?? "").trim();
      const highlight = String(item.highlight ?? "").trim();
      const ids = Array.isArray(item.sparkIds)
        ? item.sparkIds
            .map((value) => String(value))
            .filter((id) => validSparkIds.has(id))
        : [];
      return { chapter, summary, sparkIds: ids, highlight };
    })
    .filter((item) => item.chapter && item.summary);

  if (chapters.length === 0) {
    return null;
  }

  return {
    title: String(parsed.title ?? "这一段").trim() || "这一段",
    subtitle: String(parsed.subtitle ?? "").trim(),
    tone: String(parsed.tone ?? "温柔").trim() || "温柔",
    chapters,
    closing: String(parsed.closing ?? "").trim(),
  } satisfies StoryPayload;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      messages?: IncomingMessage[];
      sparks?: IncomingSpark[];
    };
    const sparks = (body.sparks ?? []).filter(
      (card) =>
        typeof card.id === "string" &&
        typeof card.title === "string" &&
        typeof card.emotion === "string" &&
        typeof card.insight === "string",
    );

    if (sparks.length < 2) {
      return NextResponse.json({ skip: true });
    }

    const sparkDigest = sparks
      .map(
        (card, index) =>
          `[#${index + 1}] id=${card.id} · ${card.emotion} · ${card.title}\n${card.insight}`,
      )
      .join("\n\n");

    const dialogueDigest = (body.messages ?? [])
      .slice(-24)
      .map((item) => `${item.role === "user" ? "用户" : "朋友"}：${item.content}`)
      .join("\n");

    const response = await deepseekChat({
      messages: [
        { role: "system", content: STORY_BUILDER_PROMPT },
        {
          role: "user",
          content:
            `下面是这次对话中提炼出的火花卡片：\n\n${sparkDigest}\n\n` +
            `下面是完整的对话节选：\n\n${dialogueDigest}\n\n` +
            `请基于以上素材生成一篇温柔的人生小传。`,
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

    const payload = buildPayload(parsed, sparks);
    if (!payload) {
      return NextResponse.json({ skip: true });
    }

    return NextResponse.json({ story: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "故事生成失败。";
    return NextResponse.json({ error: message, skip: true }, { status: 500 });
  }
}