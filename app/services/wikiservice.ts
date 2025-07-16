import G from "../global";
import { adminDb } from "../firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export type WikiArticle =
  {
    pageid: string;
    normalizedtitle: string;
    description?: string;
    timestamp?: string;
    categories?: string[];
    cachedAt: Timestamp;
  };
export type Category =
  {
    title: string;
  };


export async function getRandomArticle() {
  let currentStoredCount = 0;

  try {
    const dbSnapshot = await adminDb.collection("articles").count().get();
    currentStoredCount = dbSnapshot.data().count;
  } catch (e) {
    console.warn("Collection not found yet. Assuming empty vault.");
    currentStoredCount = 0;
  }

  if (currentStoredCount >= G.minimumArticles) {
    const randomIndex = Math.floor(Math.random() * currentStoredCount);

    const randomQuery = await adminDb
      .collection("articles")
      .offset(randomIndex)
      .limit(1)
      .get();

    const doc = randomQuery.docs[0];
    const articleData = doc?.data();

    return articleData ?? null;
  }
}
