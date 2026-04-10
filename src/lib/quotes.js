import { sampleQuotes } from "../data/sampleQuotes";
import { getLocalCommentCount } from "./comments";
import { getLocalQuoteViewCount, normalizeCount } from "./metrics";
import { hasSupabaseCredentials, supabase } from "./supabase";

const sortQuotes = (quotes) =>
  [...quotes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

const isMissingQuotesTableError = (error) => {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    message.includes("could not find the table 'public.quotes'") ||
    message.includes("relation \"public.quotes\" does not exist") ||
    message.includes("schema cache")
  );
};

const withQuoteViewCounts = (quotes, useLocalCounts) =>
  quotes.map((quote) => ({
    ...quote,
    view_count: useLocalCounts
      ? getLocalQuoteViewCount(quote.id)
      : normalizeCount(quote.view_count),
    comment_count: useLocalCounts
      ? getLocalCommentCount(quote.id)
      : normalizeCount(quote.comment_count),
  }));

async function uploadQuoteImage(imageFile) {
  const fileExtension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `quotes/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("quote-images")
    .upload(filePath, imageFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      "Unable to upload the image. Make sure the Supabase bucket 'quote-images' exists and allows uploads.",
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("quote-images").getPublicUrl(filePath);

  return publicUrl;
}

export async function fetchQuotes() {
  if (!hasSupabaseCredentials) {
    return {
      quotes: withQuoteViewCounts(sortQuotes(sampleQuotes), true),
      mode: "local",
      notice: "Supabase keys are missing, so the app is using local starter quotes.",
    };
  }

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingQuotesTableError(error)) {
      return {
        quotes: withQuoteViewCounts(sortQuotes(sampleQuotes), true),
        mode: "setup-required",
        notice:
          "Supabase is connected, but the quotes table has not been created yet. Run supabase/schema.sql in the Supabase SQL Editor to finish setup.",
      };
    }

    throw new Error(error.message);
  }

  return {
    quotes: withQuoteViewCounts(data ?? [], false),
    mode: "supabase",
    notice: "",
  };
}

export async function addQuote(quote) {
  const imageUrl = quote.imageFile
    ? hasSupabaseCredentials
      ? await uploadQuoteImage(quote.imageFile)
      : quote.imagePreview
    : "";

  const payload = {
    content: quote.content.trim(),
    author: quote.author.trim(),
    category: quote.category.trim() || "General",
    image_url: imageUrl || null,
  };

  if (!hasSupabaseCredentials) {
    return {
      id: Date.now(),
      ...payload,
      view_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from("quotes")
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (isMissingQuotesTableError(error)) {
      throw new Error(
        "Supabase is connected, but the quotes table is missing. Run supabase/schema.sql in the Supabase SQL Editor, then try saving again.",
      );
    }

    throw new Error(error.message);
  }

  return data;
}

export async function updateQuote(quote) {
  let imageUrl = quote.image_url ?? null;

  if (quote.removeImage) {
    imageUrl = null;
  }

  if (quote.imageFile) {
    imageUrl = hasSupabaseCredentials
      ? await uploadQuoteImage(quote.imageFile)
      : quote.imagePreview;
  }

  const payload = {
    content: quote.content.trim(),
    author: quote.author.trim(),
    category: quote.category.trim() || "General",
    image_url: imageUrl,
  };

  if (!hasSupabaseCredentials) {
    return {
      ...quote,
      ...payload,
    };
  }

  const { data, error } = await supabase
    .from("quotes")
    .update(payload)
    .eq("id", quote.id)
    .select()
    .maybeSingle();

  if (error) {
    if (isMissingQuotesTableError(error)) {
      throw new Error(
        "Supabase is connected, but the quotes table is missing. Run supabase/schema.sql in the Supabase SQL Editor, then try editing again.",
      );
    }

    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(
      "The quote could not be updated in Supabase. Make sure the update policy from supabase/schema.sql has been run, then try again.",
    );
  }

  return data;
}
