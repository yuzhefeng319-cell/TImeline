import type { SparkCard } from "@/lib/types";

const emotionStyles: Record<string, string> = {
  温暖: "bg-amber-50 text-amber-800",
  喜悦: "bg-rose-50 text-rose-700",
  平静: "bg-emerald-50 text-emerald-800",
  怀念: "bg-violet-50 text-violet-700",
  释然: "bg-sky-50 text-sky-800",
  好奇: "bg-orange-50 text-orange-800",
  感动: "bg-pink-50 text-pink-700",
};

function emotionClass(emotion: string) {
  return emotionStyles[emotion] ?? "bg-stone-100 text-stone-700";
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

type SparkPanelProps = {
  cards: SparkCard[];
  liveCard?: Partial<SparkCard> | null;
  extracting?: boolean;
  canBuildStory?: boolean;
  onBuildStory?: () => void;
};

function LiveCard({ card }: { card: Partial<SparkCard> }) {
  return (
    <article
      className="relative rounded-3xl border border-amber-300/60 bg-white p-5 shadow-[0_12px_30px_-20px_rgba(92,64,51,0.45)] animate-[cardGlow_2s_ease-in-out_infinite]"
      style={{
        boxShadow: "0 0 0 1px rgba(251,191,36,0.25), 0 12px 30px -20px rgba(92,64,51,0.45)",
      }}
    >
      <div className="absolute inset-0 rounded-3xl animate-pulse bg-amber-50/30" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-base text-stone-800">{card.title ?? "…"}</h3>
          {card.emotion && (
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] ${emotionClass(card.emotion)}`}>
              {card.emotion}
            </span>
          )}
        </div>
        {card.time_anchor && (
          <p className="mt-2 text-xs text-stone-400">{card.time_anchor}</p>
        )}
        {card.fact_summary && (
          <p className="mt-2 text-xs leading-6 text-stone-500 italic">{card.fact_summary}</p>
        )}
        {card.emotional_peak && (
          <p className="mt-3 text-sm leading-7 text-stone-700 font-medium">
            {card.emotional_peak}
          </p>
        )}
        {card.inner_insight && (
          <p className="mt-2 text-sm leading-7 text-stone-600">{card.inner_insight}</p>
        )}
        {card.keywords && card.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {card.keywords.map((kw) => (
              <span key={kw} className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function SparkPanel({ cards, liveCard, extracting, canBuildStory, onBuildStory }: SparkPanelProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-stone-200/70 bg-[#f3eee6]/70 lg:border-l">
      <div className="space-y-4 border-b border-stone-200/70 px-6 py-5">
        <div>
          <p className="font-serif text-lg text-stone-800">人生火花卡片</p>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            对话里那些轻轻亮起来的瞬间，会落在这里。
          </p>
        </div>
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
                ? `已有 ${cards.length} 张卡片，可以开始串成一篇小传`
                : "至少需要 2 张卡片"}
            </span>
          </span>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-amber-700 shadow-[0_4px_14px_-10px_rgba(92,64,51,0.35)] transition group-hover:translate-x-0.5">
            →
          </span>
        </button>
        {liveCard ? (
          <LiveCard card={liveCard} />
        ) : extracting ? (
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            正在轻轻记下这一刻…
            <div className="ml-2 h-0.5 flex-1 overflow-hidden rounded-full bg-stone-200/80">
              <div className="h-full w-1/3 animate-[progress_1.4s_ease-in-out_infinite] rounded-full bg-amber-400" />
            </div>
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {cards.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300/80 bg-white/50 px-5 py-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700">
              ✦
            </div>
            <p className="text-sm leading-6 text-stone-500">
              还没有卡片。随便聊聊今天的心情、一件小事，或一个还没说出口的念头。
            </p>
          </div>
        ) : (
          cards.map((card) => (
            <article
              key={card.id}
              className="rounded-3xl border border-white/80 bg-white p-5 shadow-[0_12px_30px_-20px_rgba(92,64,51,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-18px_rgba(92,64,51,0.5)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-base text-stone-800">{card.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] ${emotionClass(card.emotion)}`}
                >
                  {card.emotion}
                </span>
              </div>
              <p className="mt-2 text-xs text-stone-400">{formatTime(card.time)}</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">{card.insight}</p>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}