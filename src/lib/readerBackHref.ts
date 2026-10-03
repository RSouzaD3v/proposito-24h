const READER_HOME = "/reader/area";

export function resolveReaderBackHref(from?: string | string[]) {
  const value = Array.isArray(from) ? from[0] : from;
  if (!value || value.startsWith("//") || value.includes("\\")) return READER_HOME;
  return value === READER_HOME || value.startsWith(`${READER_HOME}/`) ? value : READER_HOME;
}

export function withReaderBackHref(href: string, from: string) {
  return `${href}?from=${encodeURIComponent(from)}`;
}
