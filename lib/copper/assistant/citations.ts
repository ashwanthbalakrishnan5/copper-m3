// Copper cites the customer documents like [Copper Home User Guide, p. 9].
// The chat panel turns each citation into a link that opens the PDF at that page.
import { DOCUMENTS, pageUrl } from "@/lib/copper/documents";

export type Citation = { label: string; url: string };

const CITATION = /\[([^[\]]+?), p\. ?(\d+)\]/g;

/** Splits a reply into text and citations. A citation of an unknown document stays text. */
export function splitCitations(text: string): (string | Citation)[] {
  const parts: (string | Citation)[] = [];
  let last = 0;
  for (const match of text.matchAll(CITATION)) {
    const doc = DOCUMENTS.find((d) => d.title === match[1].trim());
    if (!doc) continue;
    parts.push(text.slice(last, match.index), {
      label: match[0],
      url: pageUrl(doc, Number(match[2])),
    });
    last = match.index + match[0].length;
  }
  parts.push(text.slice(last));
  return parts.filter((part) => part !== "");
}
