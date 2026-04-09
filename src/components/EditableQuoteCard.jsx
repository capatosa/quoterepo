const noteStyles = [
  "note-yellow -rotate-2",
  "note-rose rotate-1",
  "note-sky -rotate-1",
  "note-mint rotate-2",
];

export default function EditableQuoteCard({
  quote,
  onEdit,
  onOpen,
  noteIndex = 0,
}) {
  const createdAt = new Date(quote.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const noteStyle = noteStyles[noteIndex % noteStyles.length];

  return (
    <article
      className={`sticky-note cursor-pointer ${noteStyle}`}
      onClick={() => onOpen(quote)}
    >
      <div className="absolute left-1/2 top-0 h-6 w-20 -translate-x-1/2 -translate-y-1/2 rotate-[-4deg] rounded-sm bg-stone-200/40 shadow-md backdrop-blur-sm" />

      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-full border border-stone-900/10 bg-white/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-700">
          {quote.category}
        </span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-stone-600">
          {createdAt}
        </span>
      </div>

      <p className="line-clamp-5 font-display text-[1.65rem] leading-[1.08] text-stone-900 md:text-[1.8rem]">
        "{quote.content}"
      </p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="truncate pr-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700">
          {quote.author}
        </p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(quote);
          }}
          className="shrink-0 rounded-full border border-stone-900/10 bg-white/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-800 transition hover:bg-white/70"
        >
          Edit
        </button>
      </div>
    </article>
  );
}
