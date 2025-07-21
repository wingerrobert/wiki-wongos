import { JSX } from "react";
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

export function getChoppedGuess(
  guess: string,
  answer: string,
  isHighlighting: boolean
): JSX.Element[] | string {
  if (!isHighlighting) {
    return guess;
  }

  const result: JSX.Element[] = [];

  for (let i = 0; i < guess.length; i++) {
    const guessChar = guess[i];
    const answerChar = answer[i];

    const isMatch =
      sanitizeGuess(guessChar) !== "" &&
      sanitizeGuess(guessChar) === sanitizeGuess(answerChar ?? "");

    result.push(
      <span
        key={ i }
        className = {`inline ${isMatch ? "text-yellow-400 font-bold" : "text-red-500"
        }`}
      >
    { guessChar }
    </span>
    );
}

return result;
}

export function getChoppedPlaceholder(placeholder: string, guess: string) {
  return placeholder?.substring(guess.length, placeholder.length)
}

function sanitizeGuess(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-zA-Z0-9]/g, "")    // Strip symbols/punctuation
    .toLowerCase();
}


// Returns between 0 -> 1, 0 being 100% dissimilar and 1 being 100% similar
export function getAnswerCorrect(answer: string, title: string) {
  if (G.useLevenshteinDistance) {
    const distance = getLevenshteinDistance(answer.toLowerCase(), title.toLowerCase());
    const maxLength = Math.max(answer.length, title.length);
    const similarityScore = 1 - distance / maxLength;

    return Math.round(similarityScore) > G.correctnessThreshold;
  }

  return sanitizeGuess(answer) === sanitizeGuess(title);
}

export function isWikiArticle(obj: any): obj is WikiArticle {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.title === 'string' &&
    typeof obj.normalizedtitle === 'string'
  );
}

export function revealSingleLetterInPlaceholder(answer: string, lastPlaceholder: string) {
  let placeholder: string[] = [];
  let currentIteration = 0;

  if (!!lastPlaceholder && typeof lastPlaceholder === "string") {
    placeholder = lastPlaceholder.split('');

    while (currentIteration++ < G.maxLoopIterations) {
      const randomIndex = Math.floor(Math.random() * lastPlaceholder.length);

      if (placeholder[randomIndex] === "_") {
        placeholder[randomIndex] = answer[randomIndex];
        return placeholder.join('');
      }
    }

    return placeholder.join('');
  }
}

export function revealWordInPlaceholder(answer: string, lastPlaceholder?: string) {
  const answerWords = answer.trim().split(" ");
  const placeholderWords = (lastPlaceholder?.trim() ?? makePlaceholderText(answer, "") ?? "").split(" ");

  let wordIndex = -1;

  // Find a word that still contains underscores
  for (let attempts = 0; attempts < G.maxLoopIterations; attempts++) {
    const i = Math.floor(Math.random() * answerWords.length);
    if (placeholderWords[i]?.includes("_")) {
      wordIndex = i;
      break;
    }
  }

  if (wordIndex === -1) {
    console.warn("No unrevealed word found.");
    return lastPlaceholder;
  }

  // Reveal the word
  placeholderWords[wordIndex] = answerWords[wordIndex];

  return placeholderWords.join(" ");
}

export function makePlaceholderText(answer: string, lastPlaceholder: string) {
  if (!answer) {
    return;
  }

  return answer.split('').map(c => {
    if ("!@#$%^&*()_+-=\\|[]{}?/,.<>;:'\" ".includes(c)) {
      return c;
    }

    return "_";
  }).join("");
}

