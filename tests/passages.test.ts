// @vitest-environment node
import { describe, expect, it } from "vitest";
import { EMBEDDING_DIMENSIONS } from "@/lib/ai/models";
import { DOCUMENTS } from "@/lib/copper/documents";
import { PASSAGES } from "@/lib/copper/passages";
import { splitPage } from "@/lib/copper/split-passages";

describe("splitPage", () => {
  it("groups a page into passages of three sentences", () => {
    const page = "One. Two.\nThree. Four. Five.";
    expect(splitPage(page)).toEqual(["One. Two. Three.", "Four. Five."]);
  });

  it("drops the footer, document code and page counter", () => {
    const page = [
      "Hello there.",
      "© 2026 Copper State Labs, Inc.",
      "CSL-KB-0310 Help Center article",
      "Page 2 of 6",
    ].join("\n");
    expect(splitPage(page)).toEqual(["Hello there."]);
  });

  it("caps a long run without full stops", () => {
    const passages = splitPage(`${"word ".repeat(200)}. Next.`);
    expect(passages).toHaveLength(2);
  });
});

describe("PASSAGES", () => {
  it("has passages from every document", () => {
    for (const doc of DOCUMENTS) {
      expect(
        PASSAGES.some((p) => p.documentId === doc.id),
        doc.id,
      ).toBe(true);
    }
  });

  it("starts each passage with its document title and keeps its page", () => {
    for (const p of PASSAGES) {
      const doc = DOCUMENTS.find((d) => d.id === p.documentId);
      expect(p.title).toBe(doc?.title);
      expect(p.text.startsWith(`${p.title}: `)).toBe(true);
      expect(p.page).toBeGreaterThanOrEqual(1);
      expect(p.embedding).toHaveLength(EMBEDDING_DIMENSIONS);
    }
  });
});
