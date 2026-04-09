import { sampleQuotes } from "../data/sampleQuotes";
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

export async function fetchQuotes() {
  if (!hasSupabaseCredentials) {
    return {
      quotes: sortQuotes(sampleQuotes),
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
        quotes: sortQuotes(sampleQuotes),
        mode: "setup-required",
        notice:
          "Supabase is connected, but the quotes table has not been created yet. Run supabase/schema.sql in the Supabase SQL Editor to finish setup.",
      };
    }

    throw new Error(error.message);
  }

  return {
    quotes: data ?? [],
    mode: "supabase",
    notice: "",
  };
}

export async function addQuote(quote) {
  const payload = {
    content: quote.content.trim(),
    author: quote.author.trim(),
    category: quote.category.trim() || "General",
  };

  if (!hasSupabaseCredentials) {
    return {
      id: Date.now(),
      ...payload,
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
  const payload = {
    content: quote.content.trim(),
    author: quote.author.trim(),
    category: quote.category.trim() || "General",
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
