// The customer documents, split into passages of a few sentences and embedded
// (Module 3). npm run embed-docs builds data/passages.json from the PDFs in
// public/docs/; importing this file loads every passage into memory once per
// server, so searching them needs no database.
import data from "./data/passages.json";

export type Passage = {
  /** The id of the document in DOCUMENTS it came from. */
  documentId: string;
  title: string;
  /** Page number in the PDF, starting at 1. */
  page: number;
  /** Starts with the document title, e.g. "Copper Plus FAQ: …". */
  text: string;
  /** EMBEDDING_DIMENSIONS numbers from EMBEDDING_MODEL. */
  embedding: number[];
};

export const PASSAGES: Passage[] = data.passages;
