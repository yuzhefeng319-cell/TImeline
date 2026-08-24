"use client";

import type { SparkCard } from "@/lib/types";

export type ChapterEntry = {
  chapter: string;
  cards: SparkCard[];
  /** Timestamp of the first card in this chapter — used for ordering */
  createdAt: number;
};

type StorylineTimelineProps = {
  chapters: ChapterEntry[];
  canBuildStory: boolean;
  onBuildStory: () => void;
  /** The card currently being formed in a streaming response */
  liveCard?: Partial<SparkCard> | null;
  liveChapter?: string | null;
  extracting?: boolean;
  storyView: "sparks" | "story";
  onBackToSparks: () => void;
};

const emotionStyles: Record<string, string> = {
  温暖: "bg-amber-50 text-amber-800 ring-amber-200",
  喜悦: "bg-rose-50 text-rose-700 ring-rose-200",
  平静: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  怀念: "bg-violet-50 text-violet-700 ring-violet-200",
  释然: "bg-sky-50 text-sky-800 ring-sky-200",
  好奇: "bg-orange-50 text-orange-800 ring-orange-200",
  感动: "bg-pink-50 text-pink-700 ring-pink-200",
};

function emotionClass(emotion: string) {
  return emotionStyles[emotion] ?? "bg-stone-100 text-stone-700 ring-stone-200";
}

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function LiveCardDot({ chapter }: { chapter: string }) {
  return (
    <div className="relative flex items-start gap-3">
      {/* Vertical line */}
      <div className="relative flex flex-col items-center">
        <div className="z-10 flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 ring-2 ring-amber-300 shadow-[0_0_0_3px_rgba(251,191,36,0.2)]">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-amber-300 to-transparent" />
      </div>
      <div className="min-h-[60px] flex-1 animate-pulse rounded-2xl border border-amber-200/60 bg-white/60 p-4 shadow-sm">
        <div className="mb-2 h-4 w-24 rounded-full bg-amber-100" />
        <div className="mb-1 h-3 w-16 rounded-full bg-stone-100" />
        <div className="mt-3 h-3 w-full rounded-full bg-stone-100" />
        <div className="mt-2 h-3 w-3/4 rounded-full bg-stone-100" />
      </div>
    </div>
  );
}

function CardNode({ card, isNew }: { card: SparkCard; isNew: boolean }) {
  return (
    <div
      className={`relative flex items-start gap-3 ${isNew ? "animate-[fadeSlideIn_0.4s_ease-out_both]" : ""}`}
    >
      {/* Dot on the timeline */}
      <div className="relative flex flex-col items-center">
        <div className={`z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ${emotionClass(card.emotion).split(" ").pop() ?? "ring-stone-200"}`}>
          <div className="h-2 w-2 rounded-full bg-current opacity-60" />
        </div>
      </div>

      {/* Card content */}
      <article
        className={`mb-4 flex-1 rounded-2xl border border-white/80 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(92,64,51,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-10px_rgba(92,64,51,0.4)] ${isNew ? "animate-[fadeSlideIn_0.4s_ease-out_both]" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-sm text-stone-800 leading-snug">{card.title}</h3>
          {card.emotion && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${emotionClass(card.emotion)}`}>
              {card.emotion}
            </span>
          )}
        </div>
        {card.time_anchor && (
          <p className="mt-1.5 text-[11px] text-stone-400">{card.time_anchor}</p>
        )}
        {card.emotional_peak && (
          <p className="mt-2 text-xs leading-6 text-stone-700 font-medium">{card.emotional_peak}</p>
        )}
        {card.insight && (
          <p className="mt-1.5 text-xs leading-5 text-stone-500">{card.insight}</p>
        )}
        <p className="mt-2 text-[10px] text-stone-300">{formatTime(card.time)}</p>
      </article>
    </div>
  );
}

function ChapterSection({ chapter, cards, isFirst, isNew }: { chapter: string; cards: SparkCard[]; isFirst: boolean; isNew: boolean }) {
  return (
    <div className={`${isNew ? "animate-[fadeSlideIn_0.5s_ease-out_both]" : ""}`}>
      {/* Chapter header */}
      <div className="relative flex items-center gap-3 pb-3">
        {!isFirst && <div className="absolute left-[9px] top-[-12px] h-3 w-px bg-stone-200" />}
        <div className="z-10 flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="text-[11px] font-medium text-stone-600 tracking-wide">{chapter}</span>
        </div>
      </div>

      {/* Cards in this chapter */}
      <div className="ml-2.5">
        {cards.map((card) => (
          <CardNode key={card.id} card={card} isNew={isNew} />
        ))}
      </div>
    </div>
  );
}

export function StorylineTimeline({
  chapters,
  canBuildStory,
  onBuildStory,
  liveCard,
  liveChapter,
  extracting,
}: StorylineTimelineProps) {
  const hasChapters = chapters.length > 0;
  const liveCardExists = !!(liveCard && liveCard.title);

  return (
    <aside className="flex h-full min-h-0 flex-col border-stone-200/70 bg-[#f3eee6]/70 lg:border-l">
      {/* Header */}
      <div className="space-y-4 border-b border-stone-200/70 px-5 py-5">
        <div>
          <p className="font-serif text-lg text-stone-800">人生故事线</p>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            聊着聊着，这条线就慢慢显形了。
          </p>
        </div>

        {/* Build story button */}
        <button
          type="button"
          onClick={onBuildStory}
          disabled={!canBuildStory}
          className="group flex w-full items-center justify-between rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-rose-50 px-4 py-3 text-left transition hover:from-amber-100 hover:to-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex flex-col">
            <span className="font-serif text-sm text-stone-800">整理我的人生故事</span>
            <span className="text-[11px] leading-4 text-stone-500">
              {canBuildStory
                ? `已有 ${chapters.reduce((n, c) => n + c.cards.length, 0)} 张碎片，可以串起来了`
                : "至少需要 2 张碎片"}
            </span>
          </span>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-amber-700 shadow-[0_4px_14px_-10px_rgba(92,64,51,0.35)] transition group-hover:translate-x-0.5">
            →
          </span>
        </button>

        {/* Live card indicator */}
        {liveCardExists ? (
          <LiveCardDot chapter={liveChapter ?? "此刻"} />
        ) : extracting ? (
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            正在轻轻记下这一刻…
          </div>
        ) : null}
      </div>

      {/* Timeline */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {!hasChapters && !liveCardExists ? (
          <div className="rounded-3xl border border-dashed border-stone-300/80 bg-white/50 px-5 py-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700">
              ✦
            </div>
            <p className="text-sm leading-6 text-stone-500">
              还没有碎片。随便聊聊今天的心情、一件小事，或一个还没说出口的念头。
            </p>
          </div>
        ) : (
          chapters.map((entry, idx) => (
            <ChapterSection
              key={entry.chapter}
              chapter={entry.chapter}
              cards={entry.cards}
              isFirst={idx === 0}
              isNew={false}
            />
          ))
        )}
      </div>
    </aside>
  );
}
