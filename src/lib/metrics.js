import { hasSupabaseCredentials, supabase } from "./supabase";

const SITE_VISIT_KEY = "quote-wall:site-visits";
const QUOTE_VIEW_PREFIX = "quote-wall:quote-views:";

let siteVisitRequest = null;

export const normalizeCount = (value) => {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? count : 0;
};

export const formatCount = (value, singularLabel) => {
  const count = normalizeCount(value);
  const label = count === 1 ? singularLabel : `${singularLabel}s`;
  return `${count.toLocaleString()} ${label}`;
};

const readLocalCount = (key) => {
  try {
    return normalizeCount(window.localStorage.getItem(key));
  } catch {
    return 0;
  }
};

const writeLocalCount = (key, value) => {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Local storage can be unavailable in private or restricted browser modes.
  }
};

const incrementLocalCount = (key) => {
  const nextCount = readLocalCount(key) + 1;
  writeLocalCount(key, nextCount);
  return nextCount;
};

export const getLocalQuoteViewCount = (quoteId) =>
  readLocalCount(`${QUOTE_VIEW_PREFIX}${quoteId}`);

export function recordSiteVisit() {
  if (!siteVisitRequest) {
    siteVisitRequest = (async () => {
      if (!hasSupabaseCredentials) {
        return incrementLocalCount(SITE_VISIT_KEY);
      }

      const { data, error } = await supabase.rpc("increment_site_visit");

      if (error) {
        console.warn("Unable to record site visit in Supabase.", error);
        return incrementLocalCount(SITE_VISIT_KEY);
      }

      return normalizeCount(data);
    })();
  }

  return siteVisitRequest;
}

export async function recordQuoteView(quoteId) {
  const localKey = `${QUOTE_VIEW_PREFIX}${quoteId}`;

  if (!hasSupabaseCredentials) {
    return incrementLocalCount(localKey);
  }

  const { data, error } = await supabase.rpc("increment_quote_view", {
    quote_id: quoteId,
  });

  if (error) {
    console.warn("Unable to record quote view in Supabase.", error);
    return incrementLocalCount(localKey);
  }

  return normalizeCount(data);
}
