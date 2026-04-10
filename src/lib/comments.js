import { normalizeCount } from "./metrics";
import { hasSupabaseCredentials, supabase } from "./supabase";

const COMMENT_PREFIX = "quote-wall:comments:";

const getCommentKey = (quoteId) => `${COMMENT_PREFIX}${quoteId}`;

const isMissingCommentsTableError = (error) => {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    message.includes("could not find the table 'public.comments'") ||
    message.includes('relation "public.comments" does not exist') ||
    message.includes("schema cache")
  );
};

const sortComments = (comments) =>
  [...comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

const readLocalComments = (quoteId) => {
  try {
    const savedComments = window.localStorage.getItem(getCommentKey(quoteId));
    return savedComments ? sortComments(JSON.parse(savedComments)) : [];
  } catch {
    return [];
  }
};

const writeLocalComments = (quoteId, comments) => {
  try {
    window.localStorage.setItem(
      getCommentKey(quoteId),
      JSON.stringify(sortComments(comments)),
    );
  } catch {
    // Local storage can be unavailable in private or restricted browser modes.
  }
};

const addLocalComment = ({ quoteId, author, content }) => {
  const newComment = {
    id: Date.now(),
    quote_id: quoteId,
    author: author.trim() || "Guest",
    content: content.trim(),
    created_at: new Date().toISOString(),
  };
  const comments = [...readLocalComments(quoteId), newComment];
  writeLocalComments(quoteId, comments);
  return newComment;
};

export const getLocalCommentCount = (quoteId) =>
  normalizeCount(readLocalComments(quoteId).length);

export async function fetchQuoteComments(quoteId) {
  if (!hasSupabaseCredentials) {
    return readLocalComments(quoteId);
  }

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("quote_id", quoteId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingCommentsTableError(error)) {
      return readLocalComments(quoteId);
    }

    throw new Error(error.message);
  }

  return data ?? [];
}

export async function addQuoteComment({ quoteId, author, content }) {
  const payload = {
    quote_id: quoteId,
    author: author.trim() || "Guest",
    content: content.trim(),
  };

  if (!payload.content) {
    throw new Error("Write a comment before posting.");
  }

  if (!hasSupabaseCredentials) {
    return addLocalComment(payload);
  }

  const { data, error } = await supabase
    .from("comments")
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (isMissingCommentsTableError(error)) {
      return addLocalComment(payload);
    }

    throw new Error(error.message);
  }

  return data;
}
