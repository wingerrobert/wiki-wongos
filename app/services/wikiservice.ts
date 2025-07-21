import G, { gameState } from "../global";
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

const ARTICLE_DIFFICULTY_THRESHOLD = 0.2;
const MAX_ARTICLE_DIFFICULTY = 1 - ARTICLE_DIFFICULTY_THRESHOLD;
const MIN_ARTICLE_DIFFICULTY = ARTICLE_DIFFICULTY_THRESHOLD;

const MAX_GUESS_THRESHOLD = 30; // used to calculate difficulty. Basically an estimate for the number of guesses for a very hard question.
const WHISPER_WEIGHT = 0.8; // how much the whispers weigh into the equation

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
  } catch (e) {
    console.error("Error updating article difficulty: ", e);
  }
}

function getNormalizedDifficulty() {
  const clampedLevel = Math.min(100, Math.max(0, gameState.levelsCompleted ?? 0));
  const normalizedProgress = clampedLevel / 100;
  const targetDifficulty = MIN_ARTICLE_DIFFICULTY + normalizedProgress * (MAX_ARTICLE_DIFFICULTY - MIN_ARTICLE_DIFFICULTY);

  const lowerBound = Math.max(0, targetDifficulty - ARTICLE_DIFFICULTY_THRESHOLD);
  const upperBound = Math.min(1, targetDifficulty + ARTICLE_DIFFICULTY_THRESHOLD);

  return [lowerBound, upperBound];
}


export async function getRandomArticle(): Promise<WikiArticle | null> {
  const [lowerBound, upperBound] = getNormalizedDifficulty();

  try {
    // query articles within difficulty range
    const filteredSnapshot = await adminDb
      .collection("articles")
      .where("difficulty", ">=", lowerBound)
      .where("difficulty", "<=", upperBound)
      .get();

    let articlesPool = filteredSnapshot.docs;

    // If no articles found, try articles with missing difficulty
    if (articlesPool.length === 0) {
      const fallbackSnapshot = await adminDb
        .collection("articles")
        .where("difficulty", "==", null) // If this fails, filter manually instead
        .get();

      articlesPool = fallbackSnapshot.docs;
    }

    // Final fallback: random pick from whole collection
    if (articlesPool.length === 0) {
      const dbSnapshot = await adminDb.collection("articles").count().get();
      const totalArticles = dbSnapshot.data()?.count || 0;

      if (totalArticles === 0) { 
        return null;
      }

      const randomIndex = Math.floor(Math.random() * totalArticles);
      const randomQuery = await adminDb
        .collection("articles")
        .offset(randomIndex)
        .limit(1)
        .get();

      const doc = randomQuery.docs[0];
      const articleData = doc?.data() as WikiArticle;
      articleData.timesAsked = (articleData?.timesAsked ?? 0) + 1;
      return articleData ?? null;
    }

    const previousArticles = gameState?.previousArticleIds ?? [];

    const filteredArticlePool = articlesPool.filter(doc => {
      return !previousArticles.includes(doc.id);
    });

    const randomArticleDoc = filteredArticlePool[Math.floor(Math.random() * filteredArticlePool.length)];
    const articleData = randomArticleDoc?.data() as WikiArticle;
    articleData.timesAsked = (articleData?.timesAsked ?? 0) + 1;

    return articleData ?? null;
  } catch (e) {
    console.warn("Error retrieving article:", e);
    return null;
  }
}

