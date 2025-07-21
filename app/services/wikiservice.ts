import G from "../global";
import { adminDb } from "../firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export type WikiArticle = {
  pageid: string;
  normalizedtitle: string;
  totalGuesses?: number;
  totalWhispers?: number;
  guessAverage?: number;
  whisperAverage?: number;
  timesAsked?: number;
  difficulty?: number;
  description?: string;
  extract?: string;
  timestamp?: string;
  categories?: string[];
  originalimage?: OriginalImage;
  views?: number;
  cachedAt: Timestamp;
};

export type OriginalImage = {
  height: number;
  source: string;
  width: number;
}

export type Category = {
  title: string;
};

const MAX_GUESS_THRESHOLD = 20; // used to calculate difficulty. Basically an estimate for the number of guesses for a very hard question.
const WHISPER_WEIGHT = 0.5; // how much the whispers weigh into the equation

export async function updateArticleDifficulty(articleId: string, articleGuesses: number, whispersUsed: number) {
  try {
    const snap = await adminDb.doc(`articles/${articleId}`).get();

    const articleSnap = snap.data() as WikiArticle;

    if (!articleSnap) {
      throw new Error("article does not exist in db!");
    }
    
    articleSnap.totalGuesses = (articleSnap.totalGuesses ?? 0) + articleGuesses;
    articleSnap.totalWhispers = (articleSnap.totalWhispers ?? 0) + whispersUsed;

    articleSnap.timesAsked = articleSnap.timesAsked ?? 1;

    articleSnap.guessAverage = articleSnap.totalGuesses / articleSnap.timesAsked;
    articleSnap.whisperAverage = articleSnap.totalWhispers / articleSnap.timesAsked;

    articleSnap.guessAverage = +articleSnap.guessAverage.toFixed(2);
    articleSnap.whisperAverage = +articleSnap.whisperAverage.toFixed(2);

    articleSnap.difficulty = Math.min(1, (articleSnap.guessAverage + WHISPER_WEIGHT * articleSnap.whisperAverage) / MAX_GUESS_THRESHOLD);

    await adminDb.doc(`articles/${articleId}`).set(articleSnap, { merge: true });
  }catch (e)
  {
    console.error("Error updating article difficulty: ", e);
  }
}

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
    const articleData = doc?.data() as WikiArticle;

    if (!!articleData.timesAsked) {
      articleData.timesAsked++;
    } else {
      articleData.timesAsked = 1;
    }

    return articleData ?? null;
  }
}
