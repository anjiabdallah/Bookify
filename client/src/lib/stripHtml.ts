export const stripHtml = (html: string | null) =>
  html?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() ?? null;
