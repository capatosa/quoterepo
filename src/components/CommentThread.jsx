import { formatCount } from "../lib/metrics";

const formatCommentDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const getInitial = (author) => (author?.trim()?.[0] || "G").toUpperCase();

export default function CommentThread({
  comments,
  commentsLoading,
  commentError,
  commentAuthor,
  commentDraft,
  commentSaving,
  onAuthorChange,
  onDraftChange,
  onSubmit,
}) {
  return (
    <section className="mt-8 border-t border-stone-900/10 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-700">
            Comments
          </p>
          <p className="mt-1 text-xs text-stone-600">
            {formatCount(comments.length, "comment")}
          </p>
        </div>
      </div>

      <div className="mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
        {commentsLoading ? (
          <p className="text-sm text-stone-700">Loading comments...</p>
        ) : comments.length ? (
          comments.map((comment) => (
            <article key={comment.id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-xs font-bold text-[#f6df84]">
                {getInitial(comment.author)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="rounded-lg bg-white/45 px-3 py-2 text-stone-900">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-700">
                    {comment.author || "Guest"}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-6">
                    {comment.content}
                  </p>
                </div>
                <p className="mt-1 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600">
                  {formatCommentDate(comment.created_at)}
                </p>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-lg bg-white/35 px-3 py-3 text-sm text-stone-700">
            No comments yet.
          </p>
        )}
      </div>

      {commentError ? (
        <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-900">
          {commentError}
        </p>
      ) : null}

      <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
        <input
          type="text"
          value={commentAuthor}
          onChange={(event) => onAuthorChange(event.target.value)}
          className="rounded-lg border border-stone-900/10 bg-white/45 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-600 focus:border-stone-900/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          placeholder="Your name"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <textarea
            required
            value={commentDraft}
            onChange={(event) => onDraftChange(event.target.value)}
            rows="2"
            className="min-h-12 flex-1 resize-none rounded-lg border border-stone-900/10 bg-white/45 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-600 focus:border-stone-900/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="Write a comment..."
          />
          <button
            type="submit"
            disabled={commentSaving}
            className="rounded-lg border border-stone-900/10 bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f6df84] transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {commentSaving ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </section>
  );
}
