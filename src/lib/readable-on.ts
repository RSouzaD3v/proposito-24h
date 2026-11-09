/** Cor de texto legível sobre uma cor de marca em hexadecimal. */
export function readableOn(color: string) {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return "#ffffff";
  const hex = match[1].length === 3 ? match[1].replace(/./g, "$&$&") : match[1];
  const [r, g, b] = [0, 2, 4].map((start) => parseInt(hex.slice(start, start + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 165 ? "#241c15" : "#ffffff";
}
