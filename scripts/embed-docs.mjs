// npm run embed-docs: run again whenever a PDF in public/docs/ changes.
// Reads every document in DOCUMENTS, splits each page into passages of a few
// sentences, embeds them with Gemini and writes lib/copper/data/passages.json,
// which the app loads into memory (lib/copper/passages.ts).
import { readFileSync, writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { extractText, getDocumentProxy } from "unpdf";

// The app's TypeScript files import each other as "@/lib/...": point Node at
// them, and tell it they're ES modules so it doesn't print a warning.
const root = new URL("../", import.meta.url);
registerHooks({
  resolve: (specifier, context, next) =>
    next(
      specifier.startsWith("@/")
        ? new URL(`${specifier.slice(2)}.ts`, root).href
        : specifier,
      context,
    ),
  load: (url, context, next) =>
    next(
      url,
      url.endsWith(".ts")
        ? { ...context, format: "module-typescript" }
        : context,
    ),
});

try {
  process.loadEnvFile(new URL(".env.local", root));
} catch {
  // No .env.local: the key may already be in the environment.
}

const { callEmbedMany, isAiConfigured } = await import("../lib/ai/call.ts");
const { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } =
  await import("../lib/ai/models.ts");
const { DOCUMENTS } = await import("../lib/copper/documents.ts");
const { splitPage } = await import("../lib/copper/split-passages.ts");

if (!isAiConfigured()) {
  console.error(
    "embed-docs: add GOOGLE_GENERATIVE_AI_API_KEY to .env.local first.",
  );
  process.exit(1);
}

const passages = [];
for (const doc of DOCUMENTS) {
  const file = new URL(`public${doc.file}`, root);
  const pdf = await getDocumentProxy(new Uint8Array(readFileSync(file)));
  const { text: pages } = await extractText(pdf, { mergePages: false });
  pages.forEach((pageText, index) => {
    for (const passage of splitPage(pageText)) {
      passages.push({
        documentId: doc.id,
        title: doc.title,
        page: index + 1,
        // The title goes first so the embedding knows which document it's from.
        text: `${doc.title}: ${passage}`,
      });
    }
  });
}

const { embeddings } = await callEmbedMany(
  { module: 3, feature: "embed-docs" },
  passages.map((p) => p.text),
);

const output = {
  model: EMBEDDING_MODEL,
  dimensions: EMBEDDING_DIMENSIONS,
  passages: passages.map((p, i) => ({
    ...p,
    // 6 decimals is plenty for search and halves the file size.
    embedding: embeddings[i].map((x) => Math.round(x * 1e6) / 1e6),
  })),
};
writeFileSync(
  new URL("lib/copper/data/passages.json", root),
  `${JSON.stringify(output)}\n`,
);

for (const doc of DOCUMENTS) {
  const count = passages.filter((p) => p.documentId === doc.id).length;
  console.log(`${doc.title}: ${count} passages`);
}
console.log(
  `Saved ${passages.length} passages to lib/copper/data/passages.json`,
);
