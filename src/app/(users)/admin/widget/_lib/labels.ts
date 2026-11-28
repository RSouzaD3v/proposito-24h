/** Funções puras do widget, usadas tanto na página (servidor) quanto nos controles (cliente). */
type CircleSource = {
  reference: string;
  chapter: number | null;
  verseStart: number | null;
  book: { abbrev: string; name?: string } | null;
};

/** Texto curto do círculo: "Sl 23:1". Avulso usa as iniciais da referência. */
export function circleLabel(item: CircleSource) {
  if (item.book && item.chapter && item.verseStart) {
    const abbrev = item.book.abbrev.charAt(0).toUpperCase() + item.book.abbrev.slice(1);
    return `${abbrev} ${item.chapter}:${item.verseStart}`;
  }
  return item.reference.slice(0, 8);
}
