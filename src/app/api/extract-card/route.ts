import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const extractPrompt = `
Analyze the following conversation between user and AI friend. 
Determine if the user shared a concrete memory, emotion, or life experience.

If YES, extract a card in JSON:
{
  "has_card": true,
  "chapter": "故事线章节（如：2020 大学时光 / 初入职场 / 迷茫期）",
  "card_data": {
    "title": "卡片标题（10字以内）",
    "time_anchor": "时间/场景（如：2021年冬）",
    "fact_summary": "客观事实（一句话）",
    "emotional_peak": "核心情绪",
    "inner_insight": "内心感悟/成长",
    "keywords": ["标签1", "标签2"]
  }
}

If NO (just greetings or short chat), output:
{ "has_card": false }
    `.trim();

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: extractPrompt },
          ...messages.slice(-4), // 只分析最近2轮对话
        ],
        response_format: { type: "json_object" },
        stream: false,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ has_card: false });
  }
}