const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

export function getDeepseekApiKey() {
  const key = process.env.DEEPSEEK_API_KEY?.trim();
  if (!key) {
    throw new Error("缺少 DEEPSEEK_API_KEY，请在项目根目录的 .env.local 中填写。");
  }
  return key;
}

export async function deepseekChat(options: {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  stream?: boolean;
}) {
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getDeepseekApiKey()}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: options.messages,
      stream: options.stream ?? false,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek 请求失败（${response.status}）：${detail.slice(0, 400)}`);
  }

  return response;
}
