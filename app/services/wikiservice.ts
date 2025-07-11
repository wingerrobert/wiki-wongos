import G from "../global";

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const FEED_API = 'https://api.wikimedia.org/feed/v1/wikipedia/en/featured';

export type WikiArticle =
  {
    titles: {
      normalized: string;
    };
    description?: string;
    timestamp?: string;
  };
export type Category =
  {
    title: string;
  };


function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getRandomArticleTitle(): Promise<string | null> {
  let currentIteration = 0;

  while (currentIteration++ < G.maxLoopIterations) {
    try {
      const response = await fetch(`${FEED_API}/${new Date().toISOString().slice(0, 10).replaceAll('-', '/')}`);
      const data = await response.json();

      const allTitles = [
        ...(data.tfa ? [data.tfa] : []),
        ...(data.mostread?.articles ?? []),
        ...(data.featured?.articles ?? []),
      ];

      const title = allTitles[Math.floor(Math.random() * allTitles.length)]?.normalizedtitle;
      return title ?? null;
    } catch (error) {
      console.error("Failed to fetch random Wikipedia article", error);
      await sleep(500); 
    }
  }

  return null;
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
