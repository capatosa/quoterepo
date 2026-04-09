import { useEffect, useMemo, useState } from "react";
import EditableQuoteCard from "./components/EditableQuoteCard";
import QuoteForm from "./components/QuoteForm";
import { addQuote, fetchQuotes, updateQuote } from "./lib/quotes";
import { hasSupabaseCredentials } from "./lib/supabase";

export default function App() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [editingQuote, setEditingQuote] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [dataMode, setDataMode] = useState(
    hasSupabaseCredentials ? "supabase" : "local",
  );
  const [notice, setNotice] = useState(
    hasSupabaseCredentials
      ? ""
      : "Supabase keys are missing, so the app is using local starter quotes.",
  );

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setLoading(true);
        const result = await fetchQuotes();
        setQuotes(result.quotes);
        setDataMode(result.mode);
        setNotice(result.notice);
      } catch (loadError) {
        setError(loadError.message || "Unable to load quotes.");
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, []);

  const categories = useMemo(() => {
    const allCategories = quotes.map((quote) => quote.category).filter(Boolean);
    return ["All", ...new Set(allCategories)];
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quotes.filter((quote) => {
      const matchesCategory =
        selectedCategory === "All" || quote.category === selectedCategory;
      const matchesSearch =
        !query ||
        quote.content.toLowerCase().includes(query) ||
        quote.author.toLowerCase().includes(query) ||
        quote.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [quotes, search, selectedCategory]);

  const handleSaveQuote = async (form) => {
    try {
      setSaving(true);
      setError("");
      if (editingQuote) {
        const updatedQuote = await updateQuote({ ...editingQuote, ...form });
        setQuotes((current) =>
          current.map((quote) =>
            quote.id === updatedQuote.id ? updatedQuote : quote,
          ),
        );
        setEditingQuote(null);
      } else {
        const newQuote = await addQuote(form);
        setQuotes((current) => [newQuote, ...current]);
        setShowComposer(false);
      }
      setSelectedCategory("All");
      return true;
    } catch (saveError) {
      setError(saveError.message || "Unable to save quote.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleEditQuote = (quote) => {
    setSelectedQuote(null);
    setShowComposer(true);
    setEditingQuote(quote);
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingQuote(null);
    setShowComposer(false);
    setError("");
  };

  const handleOpenQuote = (quote) => {
    setSelectedQuote(quote);
  };

  const handleCloseQuote = () => {
    setSelectedQuote(null);
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="panel h-fit p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">
            Browse
          </p>

          <label className="mt-5 block text-sm text-stone-300">
            Search
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="field mt-2"
              placeholder="Author, quote, or tag"
            />
          </label>

          <label className="mt-4 block text-sm text-stone-300">
            Category
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="field mt-2"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <p className="mt-5 text-sm leading-6 text-stone-400">
            {notice || "Live quotes are loaded from Supabase."}
          </p>
        </aside>

        <div>
          {error ? (
            <div className="panel mb-5 border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-amber-300">
                Quote Wall
              </p>
              <p className="mt-2 text-sm text-stone-400">
                A corkboard-style collection of ideas, lines, and reminders.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingQuote(null);
                setShowComposer(true);
                setError("");
              }}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-paper transition hover:bg-white/5"
            >
              Add note
            </button>
          </div>

          {loading ? (
            <div className="panel p-8 text-center text-stone-300">
              Loading quotes...
            </div>
          ) : filteredQuotes.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredQuotes.map((quote, index) => (
                <EditableQuoteCard
                  key={quote.id}
                  quote={quote}
                  noteIndex={index}
                  onEdit={handleEditQuote}
                  onOpen={handleOpenQuote}
                />
              ))}
            </div>
          ) : (
            <div className="panel p-8 text-center text-stone-300">
              No quotes match your current filters.
            </div>
          )}
        </div>
      </section>

      {showComposer || editingQuote ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 px-4 py-8 backdrop-blur-sm">
          <div className="modal-shell relative w-full max-w-2xl">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-stone-950/70 text-lg text-paper transition hover:bg-stone-900"
              aria-label="Close quote form"
            >
              x
            </button>

            <QuoteForm
              onSubmit={handleSaveQuote}
              disabled={saving}
              editingQuote={editingQuote}
              onCancelEdit={handleCancelEdit}
            />
          </div>
        </div>
      ) : null}

      {selectedQuote ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/70 px-4 py-8 backdrop-blur-sm">
          <div className="sticky-note-modal relative w-full max-w-4xl">
            <div className="sticky-note-tape sticky-note-tape-left" />
            <div className="sticky-note-tape sticky-note-tape-right" />

            <button
              type="button"
              onClick={handleCloseQuote}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-900/10 bg-white/45 text-lg text-stone-800 transition hover:bg-white/70"
              aria-label="Close quote preview"
            >
              x
            </button>

            <div className="sticky-note-modal-panel px-6 py-8 sm:px-10 sm:py-10">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-stone-900/10 bg-white/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-stone-700">
                  {selectedQuote.category}
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-stone-600">
                  {new Date(selectedQuote.created_at).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </span>
              </div>

              <div className="max-h-[60vh] overflow-hidden">
                <p className="quote-columns whitespace-pre-line text-[14px] leading-7 text-stone-900">
                  "{selectedQuote.content}"
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-700">
                  {selectedQuote.author}
                </p>

                <button
                  type="button"
                  onClick={() => handleEditQuote(selectedQuote)}
                  className="rounded-full border border-stone-900/10 bg-white/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-800 transition hover:bg-white/70"
                >
                  Edit quote
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
