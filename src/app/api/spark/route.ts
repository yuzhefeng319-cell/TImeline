import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const extractPrompt = `
分析用户最后一句话。如果分享了具体记忆/经历/情绪，提炼JSON:
{
  "has_card": true,
  "chapter": "章节名称（如：学生时代/初入职场）",
  "card_data": {
    "title": "标题（10字内）",
    "time_anchor": "时间/场景",
    "fact_summary": "客观事实",
    "emotional_peak": "核心情绪",
    "inner_insight": "内心感悟",
    "keywords": ["标签1", "标签2"]
  }
}
没分享记忆则返回: { "has_card": false }
    `.trim();

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: extractPrompt }, ...messages.slice(-2)],
        response_format: { type: "json_object" },
        stream: false,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ has_card: false, error: "API Failed" });
    }

    const arrayBuffer = await response.arrayBuffer();
    const decoder = new TextDecoder("utf-8");
    const jsonString = decoder.decode(arrayBuffer);
    const data = JSON.parse(jsonString);

    const cardContent = data.choices?.[0]?.message?.content || "{}";
    const parsed: any = JSON.parse(cardContent);

    let card: any = null;

    if (parsed && (parsed.has_card === true || parsed.card_data)) {
      const cardData = parsed.card_data || parsed;
      card = {
        has_card: true,
        chapter: parsed.chapter || "人生回忆片段",
        card_data: {
          title: cardData.title || cardData.event || "未命名回忆",
          time_anchor: cardData.time_anchor || "某个时刻",
          fact_summary: cardData.fact_summary || "",
          emotional_peak: cardData.emotional_peak || cardData.emotion || "",
          inner_insight: cardData.inner_insight || cardData.insight || "",
          keywords: Array.isArray(cardData.keywords) ? cardData.keywords : [],
        },
      };
    }

    return NextResponse.json({ card: card });
  } catch (error: any) {
    return NextResponse.json({ has_card: false, error: error.message });
  }
}
