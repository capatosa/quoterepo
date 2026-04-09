import { useEffect, useState } from "react";

const initialForm = {
  content: "",
  author: "",
  category: "",
  imageFile: null,
  imagePreview: "",
  removeImage: false,
};

export default function QuoteForm({
  onSubmit,
  disabled,
  editingQuote,
  onCancelEdit,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (editingQuote) {
      setForm({
        content: editingQuote.content ?? "",
        author: editingQuote.author ?? "",
        category: editingQuote.category ?? "",
        imageFile: null,
        imagePreview: editingQuote.image_url ?? "",
        removeImage: false,
      });
      return;
    }

    setForm(initialForm);
  }, [editingQuote]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setForm((current) => ({
      ...current,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
      removeImage: false,
    }));
  };

  const handleRemoveImage = () => {
    setForm((current) => ({
      ...current,
      imageFile: null,
      imagePreview: "",
      removeImage: true,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const didSave = await onSubmit(form);
    if (didSave) {
      setForm(initialForm);
    }
  };

  return (
    <form className="modal-panel p-6 sm:p-8" onSubmit={handleSubmit}>
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">
          {editingQuote ? "Edit quote" : "Add a quote"}
        </p>
        <h2 className="mt-2 font-display text-4xl text-paper">
          {editingQuote
            ? "Refine a quote in your collection."
            : "Capture something worth keeping."}
        </h2>
      </div>

      <div className="space-y-4">
        <textarea
          required
          name="content"
          value={form.content}
          onChange={handleChange}
          rows="4"
          className="field resize-none"
          placeholder="Write the quote here..."
        />

        <input
          required
          type="text"
          name="author"
          value={form.author}
          onChange={handleChange}
          className="field"
          placeholder="Who said it?"
        />

        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          className="field"
          placeholder="Category, theme, or tag"
        />

        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-paper">Quote image</p>
              <p className="mt-1 text-xs text-stone-400">
                Upload an optional image to pair with this quote.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-paper transition hover:bg-white/5">
              Choose file
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {form.imagePreview ? (
            <div className="mt-4 space-y-3">
              <img
                src={form.imagePreview}
                alt="Quote preview"
                className="h-40 w-full rounded-2xl object-cover"
              />

              <button
                type="button"
                onClick={handleRemoveImage}
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-paper transition hover:bg-white/5"
              >
                Remove image
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {disabled ? "Saving..." : editingQuote ? "Update quote" : "Save quote"}
        </button>

        <button
          type="button"
          onClick={onCancelEdit}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-paper transition hover:bg-white/5"
        >
          {editingQuote ? "Cancel" : "Close"}
        </button>
      </div>
    </form>
  );
}
