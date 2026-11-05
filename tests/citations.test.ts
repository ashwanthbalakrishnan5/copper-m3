// @vitest-environment node
import { describe, expect, it } from "vitest";
import { splitCitations } from "@/lib/copper/assistant/citations";

describe("splitCitations", () => {
  it("links each [Title, p. N] to that page of the PDF", () => {
    expect(
      splitCitations(
        "Unplug it. [Copper Home User Guide, p. 9] Refunds take 14 days. [Copper Plus FAQ, p. 5] [Copper State Labs Terms and Conditions, p. 4]",
      ),
    ).toEqual([
      "Unplug it. ",
      {
        label: "[Copper Home User Guide, p. 9]",
        url: "/docs/copper-home-user-guide.pdf#page=9",
      },
      " Refunds take 14 days. ",
      {
        label: "[Copper Plus FAQ, p. 5]",
        url: "/docs/copper-plus-faq.pdf#page=5",
      },
      " ",
      {
        label: "[Copper State Labs Terms and Conditions, p. 4]",
        url: "/docs/copper-terms-and-conditions.pdf#page=4",
      },
    ]);
  });

  it("leaves unknown documents and plain text alone", () => {
    expect(splitCitations("See [Some Other Guide, p. 2].")).toEqual([
      "See [Some Other Guide, p. 2].",
    ]);
    expect(splitCitations("No sources here.")).toEqual(["No sources here."]);
  });
});
