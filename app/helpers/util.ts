import G from "../global"
import { WikiArticle } from "../services/wikiservice";

function getLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  const d = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) { d[i][0] = i; }
  for (let j = 0; j <= n; j++) { d[0][j] = j; }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,     
        d[i][j - 1] + 1,     
        d[i - 1][j - 1] + cost 
      );
    }
  }

  return d[m][n];
}

// Returns between 0 -> 1, 0 being 100% dissimilar and 1 being 100% similar
export function getAnswerCorrectness(answer: string, title: string)
{
  const distance = getLevenshteinDistance(answer, title);
  const maxLength = Math.max(answer.length, title.length);
  const similarityScore = 1 - distance / maxLength;

  return Math.round(similarityScore);
}

export function isWikiArticle(obj: any): obj is WikiArticle {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.title === 'string' &&
    typeof obj.normalizedtitle === 'string'
  );
}

export function makePlaceholderText(answer: string, lastPlaceholder: string) {
  let placeholder : string[] = [];
  let currentIteration = 0;
  
  if (!!lastPlaceholder && typeof lastPlaceholder === "string")
  {
    placeholder = lastPlaceholder.split('');

    while (currentIteration++ < G.maxLoopIterations)
    {
      const randomIndex = Math.floor(Math.random() * lastPlaceholder.length);

      if (placeholder[randomIndex] === "_")
      {
        placeholder[randomIndex] = answer[randomIndex];
        return placeholder.join('');
      }
    }
    return placeholder.join('');
  }
  
  if (!answer)
  {
    console.error("Answer was null!");
    return;
  }
  
  return answer.split('').map(c => {
    if (c === " ")
    {
      return "\u00A0";
    }

    if ("!@#$%^&*()_+-=\\|[]{}?/,.<>;:'\"".includes(c))
    {
      return c;
    }

    return "_";
  }).join("");
}

