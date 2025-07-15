import G from "../global";
import { adminDb } from "../firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

export type WikiArticle =
  {
    pageid: string;
    normalizedtitle: string;
    description?: string;
    timestamp?: string;
    cachedAt: Timestamp;
  };
export type Category =
  {
    title: string;
  };


export async function getRandomArticleTitle() {
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

    return articleData?.normalizedtitle ?? null;
  }
}

export async function getCategories(title: string) {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'categories',
    cllimit: 'max',
    clshow: '!hidden',
    format: 'json',
    origin: '*',
  });
  const res = await fetch(`${WIKI_API}?${params}`);
  const data = await res.json();
  const page = data.query?.pages?.[Object.keys(data.query.pages)[0]]?.categories ?? [];

  const categories: Category[] = page
    .filter((c: any) => {
      const t = c.title.replace("Category:", "");
      return !t.toLowerCase().includes(title.toLowerCase());
    })
    .map((c: any) => c.title.replace("Category:", ""));

  return categories.length > 0 ? categories : [];
}
