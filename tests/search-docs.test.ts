// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { searchDocs } from "@/lib/copper/assistant/tools";
import { PASSAGES } from "@/lib/copper/passages";

// The "question" embeds exactly like one known passage, so it must come first.
const target = PASSAGES.find((p) => p.text.includes("C-47"))!;
vi.mock("@/lib/ai/call", () => ({
  callEmbedMany: async () => ({ embeddings: [target.embedding] }),
}));

describe("search_docs", () => {
  it("returns the 5 closest passages, closest first, with title, page and a link to that page", async () => {
    const { matches } = await searchDocs("C-47");
    expect(matches).toHaveLength(5);
    expect(matches[0]).toMatchObject({
      title: target.title,
      page: target.page,
      url: `/docs/${target.documentId}.pdf#page=${target.page}`,
      text: target.text.slice(`${target.title}: `.length),
      score: 1,
    });
    const scores = matches.map((m) => m.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});
