"use client";

import { useEffect, useRef } from "react";

type ComposerProps = {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
};

export function Composer({ value, disabled, onChange, onSend, onStop }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const canSend = !disabled && value.trim();

  return (
    <form
      className="group mx-auto flex w-full max-w-2xl items-end gap-2 rounded-[28px] border border-stone-200/80 bg-white/90 p-2 pl-4 shadow-[0_10px_40px_-18px_rgba(92,64,51,0.35)] backdrop-blur-md transition focus-within:border-[#c4785a]/60 focus-within:shadow-[0_10px_40px_-12px_rgba(196,120,90,0.45)]"
      onSubmit={(event) => {
        event.preventDefault();
        if (disabled) return;
        onSend();
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        disabled={disabled}
        placeholder={disabled ? "对方还在想…" : "跟我说点什么吧……"}
        className="max-h-40 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-6 text-stone-700 outline-none placeholder:text-stone-400 disabled:opacity-60"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (disabled) {
              onStop();
              return;
            }
            onSend();
          }
        }}
      />
      {disabled ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="停止"
          className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200/80 bg-white text-stone-500 transition hover:bg-stone-50"
        >
          <span className="block h-2.5 w-2.5 rounded-sm bg-stone-500" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSend}
          aria-label="发送"
          className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c4785a] text-white transition hover:bg-[#b5674b] disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </form>
  );
}