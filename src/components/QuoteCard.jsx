export default function QuoteCard({ quote }) {
  const createdAt = new Date(quote.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="panel p-6 shadow-glow transition-transform duration-300 hover:-translate-y-1">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
          {quote.category}
        </span>
        <span className="text-xs uppercase tracking-[0.2em] text-stone-400">
          {createdAt}
        </span>
      </div>

      <p className="font-display text-3xl leading-tight text-paper">
        “{quote.content}”
      </p>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-stone-300">
        {quote.author}
      </p>
    </article>
  );
}
