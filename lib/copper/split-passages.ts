// Splits the text of one PDF page into passages of a few sentences, so each
// passage is small enough to match one question. Used by npm run embed-docs.

const SENTENCES_PER_PASSAGE = 3;
// A table or list has no full stops, so cap a passage's length too.
const MAX_CHARS = 600;
// Lines printed on every page: the copyright footer, the document code, "Page 2 of 6".
const BOILERPLATE = /^(©|CSL-|Page \d+ of \d+$)/;

export function splitPage(pageText: string): string[] {
  const text = pageText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !BOILERPLATE.test(line))
    .join(" ");
  const sentences = [
    ...new Intl.Segmenter("en", { granularity: "sentence" }).segment(text),
  ]
    .map((s) => s.segment.trim())
    .filter(Boolean);

  const passages: string[] = [];
  let current: string[] = [];
  for (const sentence of sentences) {
    current.push(sentence);
    if (
      current.length >= SENTENCES_PER_PASSAGE ||
      current.join(" ").length >= MAX_CHARS
    ) {
      passages.push(current.join(" "));
      current = [];
    }
  }
  if (current.length) passages.push(current.join(" "));
  return passages;
}
