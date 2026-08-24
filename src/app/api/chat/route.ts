import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const systemPrompt = {
      role: "system",
      content:
        "You are a warm, genuine, intuitive friend. You MUST reply in natural, friendly Simplified Chinese (简体中文). Keep text inside 2-3 short sentences. NEVER output JSON or markdown code blocks in chat.",
    };

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [systemPrompt, ...messages],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `API Error: ${errText}` }, { status: 500 });
    }

    // 强制按照 utf-8 规则读取字节流，彻底解决中文乱码
    const arrayBuffer = await response.arrayBuffer();
    const decoder = new TextDecoder("utf-8");
    const jsonString = decoder.decode(arrayBuffer);
    const data = JSON.parse(jsonString);

    const replyText = data.choices?.[0]?.message?.content || "";

    // 静默提取卡片
    let card = null;
    try {
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
    "inner_insight": "内心感悟"
  }
}
没分享记忆则返回: { "has_card": false }
      `.trim();

      const extractRes = await fetch("https://api.deepseek.com/chat/completions", {
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

      const cardArrayBuffer = await extractRes.arrayBuffer();
      const cardJsonString = decoder.decode(cardArrayBuffer);
      const cardData = JSON.parse(cardJsonString);
      const cardContent = cardData.choices?.[0]?.message?.content;
      
      if (cardContent) {
        const parsed = JSON.parse(cardContent);
        if (parsed && parsed.has_card === true) {
          card = parsed;
        }
      }
    } catch (e) {
      // 忽略卡片报错，不阻断聊天
    }

    // 显式加上 utf-8 charset 响应头
    return new NextResponse(
      JSON.stringify({ reply: replyText, card: card }),
      {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}