import type { SparkCard, Story } from "@/lib/types";

const toneStyles: Record<string, string> = {
  温暖: "bg-amber-50 text-amber-800",
  温柔: "bg-amber-50 text-amber-800",
  平静: "bg-emerald-50 text-emerald-800",
  释然: "bg-sky-50 text-sky-800",
  喜悦: "bg-rose-50 text-rose-700",
  好奇: "bg-orange-50 text-orange-800",
  微光: "bg-violet-50 text-violet-700",
};

function toneClass(tone: string) {
  return toneStyles[tone] ?? "bg-stone-100 text-stone-700";
}

type StoryPanelProps = {
  story: Story;
  sparks: SparkCard[];
  loading?: boolean;
  storyError?: string | null;
  onBack: () => void;
  onRetry: () => void;
};

export function StoryPanel({ story, sparks, loading, storyError, onBack, onRetry }: StoryPanelProps) {
  if (loading) {
    return (
      <aside className="flex h-full min-h-0 flex-col border-stone-200/70 bg-[#f3eee6]/70 lg:border-l">
        <div className="border-b border-stone-200/70 px-6 py-5">
          <p className="font-serif text-lg text-stone-800">正在整理你的人生故事</p>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            从对话里轻轻拣出那些微光，再串成一篇小小的传记。
          </p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <span className="block h-3 w-3 animate-ping rounded-full bg-amber-400" />
          </div>
          <p className="text-sm leading-6 text-stone-500">
            正在把你说过的瞬间，缝成一篇小传…
          </p>
        </div>
      </aside>
    );
  }

  if (storyError || !story.title) {
    return (
      <aside className="flex h-full min-h-0 flex-col border-stone-200/70 bg-[#f3eee6]/70 lg:border-l">
        <div className="flex items-center justify-between border-b border-stone-200/70 px-6 py-5">
          <div>
            <p className="text-xs tracking-[0.18em] text-stone-400 uppercase">Life Story</p>
            <p className="mt-1 font-serif text-lg text-stone-800">我的人生故事</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-stone-200/80 bg-white/70 px-3 py-1.5 text-xs text-stone-500 transition hover:bg-white"
          >
            ← 返回火花
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm leading-6 text-stone-500">
            {storyError ?? "暂时还串不成一篇故事，再聊一会儿吧。"}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-[#c4785a] px-4 py-2 text-sm text-white transition hover:bg-[#b5674b]"
          >
            再试一次
          </button>
        </div>
      </aside>
    );
  }

  const sparkById = new Map(sparks.map((card) => [card.id, card]));
  const referencedSparks = sparks.filter((card) =>
    story.chapters.some((chapter) => chapter.sparkIds.includes(card.id)),
  );

  return (
    <aside className="flex h-full min-h-0 flex-col border-stone-200/70 bg-[#f3eee6]/70 lg:border-l">
      <div className="flex items-center justify-between border-b border-stone-200/70 px-6 py-5">
        <div>
          <p className="text-xs tracking-[0.18em] text-stone-400 uppercase">Life Story</p>
          <p className="mt-1 font-serif text-lg text-stone-800">我的人生故事</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-stone-200/80 bg-white/70 px-3 py-1.5 text-xs text-stone-500 transition hover:bg-white"
        >
          ← 返回火花
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
        <article className="mx-auto max-w-xl">
          <header className="text-center">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] ${toneClass(
                story.tone,
              )}`}
            >
              {story.tone}
            </span>
            <h2 className="mt-5 font-serif text-3xl leading-tight tracking-tight text-stone-800">
              {story.title}
            </h2>
            {story.subtitle ? (
              <p className="mt-3 text-[15px] leading-7 text-stone-500">{story.subtitle}</p>
            ) : null}
          </header>

          <div className="mt-10 space-y-10">
            {story.chapters.map((chapter, index) => {
              const chapterSparks = chapter.sparkIds
                .map((id) => sparkById.get(id))
                .filter((card): card is SparkCard => Boolean(card));
              return (
                <section key={`${chapter.chapter}-${index}`} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-sm text-stone-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-serif text-xl text-stone-800">{chapter.chapter}</h3>
                  </div>
                  <p className="font-serif text-[15px] leading-8 text-stone-700">
                    {chapter.summary}
                  </p>
                  {chapter.highlight ? (
                    <blockquote className="border-l-2 border-amber-300/80 pl-4 text-[14px] italic leading-7 text-stone-500">
                      「{chapter.highlight}」
                    </blockquote>
                  ) : null}
                  {chapterSparks.length > 0 ? (
                    <ul className="flex flex-wrap gap-2 pt-1">
                      {chapterSparks.map((card) => (
                        <li
                          key={card.id}
                          className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-stone-500 shadow-[0_4px_14px_-10px_rgba(92,64,51,0.35)]"
                        >
                          ✦ {card.title}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              );
            })}
          </div>

          {story.closing ? (
            <p className="mt-12 border-t border-stone-200/70 pt-6 text-center font-serif text-[15px] italic leading-8 text-stone-500">
              {story.closing}
            </p>
          ) : null}

          {referencedSparks.length > 0 ? (
            <div className="mt-10 rounded-3xl border border-white/80 bg-white/60 p-5">
              <p className="text-xs tracking-[0.16em] text-stone-400 uppercase">被讲进故事的火花</p>
              <ul className="mt-3 space-y-2">
                {referencedSparks.map((card) => (
                  <li
                    key={card.id}
                    className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-stone-600 shadow-[0_8px_24px_-18px_rgba(92,64,51,0.35)]"
                  >
                    <span className="mt-1 text-amber-500">✦</span>
                    <span>{card.insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      </div>
    </aside>
  );
}