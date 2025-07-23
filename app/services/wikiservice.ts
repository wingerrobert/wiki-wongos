import G, { gameState, globalDefaults } from "../global";
import { adminDb } from "../firebaseAdmin";
import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";

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

let allArticles : WikiArticle[];

export async function initializeWikiService()
{
  const snapshot = await adminDb.collection("articles").limit(globalDefaults.articleLimit).get();
  allArticles = snapshot.docs.map(doc => doc.data() as WikiArticle);
}

export async function updateArticleDifficulty(articleId: string, articleGuesses: number, whispersUsed: number) {
  try {
    const article = allArticles.filter(a => a.pageid === articleId)[0];

    if (!article)
    {
      console.error("Error updating article difficulty: Page was not found in all pages");
      return;
    }

    article.totalGuesses = (article.totalGuesses ?? 0) + articleGuesses;
    article.totalWhispers = (article.totalWhispers ?? 0) + whispersUsed;

    article.timesAsked = article.timesAsked ?? 1;

    article.guessAverage = article.totalGuesses / article.timesAsked;
    article.whisperAverage = article.totalWhispers / article.timesAsked;

    article.guessAverage = +article.guessAverage.toFixed(2);
    article.whisperAverage = +article.whisperAverage.toFixed(2);

    article.difficulty = Math.min(1, (article.guessAverage + WHISPER_WEIGHT * article.whisperAverage) / MAX_GUESS_THRESHOLD);

    await adminDb.doc(`articles/${article.pageid}`).set(article, { merge: true });
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


export async function getRandomArticle(excludedIds: string[]): Promise<WikiArticle | null> {
  
  if (!allArticles)
  {
    await initializeWikiService();
  }

  const [lowerBound, upperBound] = getNormalizedDifficulty();

  try {
    // query articles within difficulty range
    let articlesPool = allArticles.filter(a => !!a.difficulty && a.difficulty >= lowerBound && a.difficulty <= upperBound);

    // If no articles found, try articles with missing difficulty
    if (articlesPool.length === 0) {
      const fallbackPool = allArticles.filter(a => !a.difficulty);

      articlesPool = fallbackPool;
    }

    // Final fallback: random pick from whole collection
    if (articlesPool.length === 0) {
      articlesPool = allArticles;
    }

    const articleData = articlesPool[Math.floor(Math.random() * articlesPool.length)];
    articleData.timesAsked = (articleData?.timesAsked ?? 0) + 1;

    return articleData ?? null;
  } catch (e) {
    console.warn("Error retrieving article:", e);
    return null;
  }
}

function filterOutPreviousArticles(articlesPool: QueryDocumentSnapshot<DocumentData, DocumentData>[], excludedIds: string[]) {
  const previousArticles = excludedIds;
  return articlesPool.filter(doc => {
    return !previousArticles.includes(doc.id);
  });
}
