"use client";

import type { ChatMessage } from "@/lib/types";

function stripJson(text: string): string {
  return text
    .replace(/```json\s*[\s\S]*?```/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\s*\{[\s\S]*?"has_card"[\s\S]*?\}(\s*)$/g, "$1")
    .trim();
}

type MessageListProps = {
  messages: ChatMessage[];
  streaming: boolean;
  error: string | null;
  starters: string[];
  onPickStarter: (text: string) => void;
};

export function MessageList({
  messages,
  streaming,
  error,
  starters,
  onPickStarter,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
        <div>
          <p className="font-serif text-3xl tracking-tight text-stone-800">很高兴遇见你</p>
          <p className="mt-4 text-[15px] leading-7 text-stone-500">
            我刚认识你，却好像已经很想听你说话。今天过得怎么样，或者有什么正轻轻敲着你？
          </p>
        </div>
        <div className="flex w-full flex-wrap justify-center gap-2">
          {starters.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => onPickStarter(text)}
              className="rounded-full border border-stone-200/80 bg-white/80 px-4 py-2 text-[13px] leading-5 text-stone-600 shadow-[0_4px_14px_-10px_rgba(92,64,51,0.25)] transition hover:-translate-y-0.5 hover:bg-white"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {messages.map((message, index) => {
        const isUser = message.role === "user";
        const isLastAssistant = !isUser && index === messages.length - 1;
        const showCursor = isLastAssistant && streaming;

        return (
          <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={
                isUser
                  ? "max-w-[85%] rounded-[22px] rounded-br-md bg-[#efe6dc] px-4 py-3 text-[15px] leading-7 text-stone-800"
                  : "max-w-[90%] rounded-[22px] rounded-bl-md bg-white px-4 py-3 text-[15px] leading-7 text-stone-700 shadow-[0_8px_24px_-18px_rgba(92,64,51,0.45)]"
              }
            >
              {stripJson(message.content) || (showCursor ? "" : "……")}
              {showCursor ? (
                <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[2px] animate-pulse bg-[#c4785a]" />
              ) : null}
            </div>
          </div>
        );
      })}
      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
          {error}（输入还在草稿里，可以再发一次。）
        </p>
      ) : null}
    </div>
  );
}