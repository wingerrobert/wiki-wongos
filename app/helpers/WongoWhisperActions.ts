import { revealSingleLetterInPlaceholder, revealWordInPlaceholder } from "./util";
import { FaA, FaArrowRight, FaFile, FaGoogle, FaHighlighter, FaPhotoFilm, FaW } from "react-icons/fa6";
import { IconType } from "react-icons";
import { gameState } from "../global";
import { FaSignOutAlt } from "react-icons/fa";

export type WongoWhisper = {
  id: string;
  difficultyWeight: number, // Difficulty of an article is affected by how many whispers were used. Since some whispers are OP we must account for this.
  label: string;
  purchaseCost: number,
  purchaseQuantity: number, // how many does purchasing get you?
  description?: string,
  onActivate: (whisper: WongoWhisper, context: WongoWhisperContext) => void;
  icon: IconType;
  special?: boolean; // shouldn't show up in shop e.g. the give up whisper only shows up when you're out of other whispers
}

export type WongoWhisperContext = {
  isTransitioning: boolean;
  articleTitle: string;
  placeholder: string;
  wongoPoints: number;
  wikiPoints: number;
  setWongoPointsAction: any;
  setWikiPointsAction: any;
  setIsCorrectAction: any;
  setPlaceholderAction: any;
  setWasSkippedAction: any;
  setLevelsCompletedAction: any;
  setWhispersUsedAction: any;
  setPurchasedPhoto: any;
  setWhisperCountsAction: any;
  setPurchasedExtractAction: any;
  startGoogleSearchAction: any;
  startHighlightAction: any;
  purchasedPhoto: boolean;
  purchasedExtract: boolean;
  hasExtract: boolean;
  whisperCounts: Record<string, number>;
  whispersUsed: number;
  levelsCompleted: number;
  wasSkipped: boolean;
  isCorrect: boolean;
  hasPhoto: boolean;
}

function revealLetter(whisper: WongoWhisper, context: WongoWhisperContext) {
  if (context.isTransitioning || context.whisperCounts[whisper.id] <= 0 || context.isCorrect) {
    return;
  }

  const newPlaceholder = revealSingleLetterInPlaceholder(context.articleTitle, context.placeholder);

  useWhisper(whisper.id, whisper.difficultyWeight, context.whisperCounts, context.setWhisperCountsAction, context.whispersUsed, context.setWhispersUsedAction);

  if (newPlaceholder === context.articleTitle) {
    context.setWikiPointsAction(context.wikiPoints + 1);
    context.setLevelsCompletedAction(context.levelsCompleted + 1);
    context.setIsCorrectAction(true);
    return;
  }

  context.setPlaceholderAction(newPlaceholder ?? "");
}

function revealWord(whisper: WongoWhisper, context: WongoWhisperContext) {
  if (context.isTransitioning || context.whisperCounts[whisper.id] <= 0 || context.isCorrect) {
    return;
  }
  const newPlaceholder = revealWordInPlaceholder(context.articleTitle, context.placeholder);

  useWhisper(whisper.id, whisper.difficultyWeight, context.whisperCounts, context.setWhisperCountsAction, context.whispersUsed, context.setWhispersUsedAction);

  if (newPlaceholder === context.articleTitle) {
    context.setWikiPointsAction(context.wikiPoints + 1);
    context.setLevelsCompletedAction(context.levelsCompleted + 1);
    context.setIsCorrectAction(true);
    return;
  }

  context.setPlaceholderAction(newPlaceholder ?? "");
}

function onSkip(whisper: WongoWhisper, context: WongoWhisperContext) {
  if (context.isTransitioning || context.whisperCounts[whisper.id] <= 0 || context.isCorrect || context.wasSkipped) {
    return;
  }

  context.setWasSkippedAction(true);
  context.setLevelsCompletedAction(context.levelsCompleted + 1);
  context.setPlaceholderAction(context.articleTitle);

  useWhisper(whisper.id, whisper.difficultyWeight, context.whisperCounts, context.setWhisperCountsAction, context.whispersUsed, context.setWhispersUsedAction);
}

function buyPicture(whisper: WongoWhisper, context: WongoWhisperContext) {
  if (context.purchasedPhoto || context.whisperCounts[whisper.id] <= 0) {
    return;
  }

  context.setPurchasedPhoto(true);

  useWhisper(whisper.id, whisper.difficultyWeight, context.whisperCounts, context.setWhisperCountsAction, context.whispersUsed, context.setWhispersUsedAction);
}

function buyExtract(whisper: WongoWhisper, context: WongoWhisperContext) {
  if (context.purchasedExtract || context.whisperCounts[whisper.id] <= 0) {
    return;
  }

  context.setPurchasedExtractAction(true);

  useWhisper(whisper.id, whisper.difficultyWeight, context.whisperCounts, context.setWhisperCountsAction, context.whispersUsed, context.setWhispersUsedAction);
}

function googleSearch(whisper: WongoWhisper, context: WongoWhisperContext) {
  if (context.whisperCounts[whisper.id] <= 0) {
    return;
  }

  context.startGoogleSearchAction();

  useWhisper(whisper.id, whisper.difficultyWeight, context.whisperCounts, context.setWhisperCountsAction, context.whispersUsed, context.setWhispersUsedAction);
}

function useWhisper(whisperId: string, whisperDifficultyWeight: number, whisperCounts: Record<string, number>, setWhisperCounts: any, whispersUsed: number, setWhispersUsed: any) {
  if (!whisperCounts[whisperId] || whisperCounts[whisperId] - 1 < 0) {
    return;
  }

  const newWhisperCounts = { ...whisperCounts, [whisperId]: whisperCounts[whisperId] - 1 };

  setWhispersUsed(whispersUsed + whisperDifficultyWeight);
  setWhisperCounts(newWhisperCounts);

  gameState.whispers = newWhisperCounts;
}

function giveUp(whisper: WongoWhisper, context: WongoWhisperContext) {
  if (context.wongoPoints !== 0) {
    context.setWongoPointsAction(0);
  }
}

function startHighlight(whisper: WongoWhisper, context: WongoWhisperContext) {
  if (context.whisperCounts[whisper.id] <= 0) {
    return;
  }

  context.startHighlightAction();

  useWhisper(whisper.id, whisper.difficultyWeight, context.whisperCounts, context.setWhisperCountsAction, context.whispersUsed, context.setWhispersUsedAction);
}

export const allWongoWhispers: WongoWhisper[] = [
  {
    id: "whisper_reveal_letter",
    difficultyWeight: 1,
    label: "Reveal Letter",
    purchaseCost: 2,
    purchaseQuantity: 20,
    onActivate: revealLetter,
    icon: FaA
  },
  {
    id: "whisper_reveal_word",
    difficultyWeight: 5,
    label: "Reveal Word",
    description: "Reveal a whole word for 8 wongo points!",
    purchaseCost: 4,
    purchaseQuantity: 6,
    onActivate: revealWord,
    icon: FaW
  },
  {
    id: "whisper_skip",
    difficultyWeight: 15,
    label: "Skip",
    description: "Skip an article!",
    purchaseCost: 3,
    purchaseQuantity: 1,
    onActivate: onSkip,
    icon: FaArrowRight
  },
  {
    id: "whisper_buy_picture",
    difficultyWeight: 10,
    label: "Show Picture",
    description: "Show a picture from the current article. Can only use once per article.",
    purchaseCost: 8,
    purchaseQuantity: 4,
    onActivate: buyPicture,
    icon: FaPhotoFilm
  },
  {
    id: "whisper_show_extract",
    difficultyWeight: 8,
    label: "Show Extract",
    description: "Show the redacted extract for the current article. Can only use once per article.",
    purchaseCost: 6,
    purchaseQuantity: 4,
    onActivate: buyExtract,
    icon: FaFile
  },
  {
    id: "whisper_end_game",
    difficultyWeight: 0,
    special: true,
    label: "Forfeit",
    description: "It's all over man!",
    purchaseCost: 0,
    purchaseQuantity: 0,
    onActivate: giveUp,
    icon: FaSignOutAlt
  },
  {
    id: "whisper_10_second_google",
    difficultyWeight: 10,
    label: "Google Search",
    description: "A quick 10 second Google Search. Better work fast!",
    purchaseCost: 8,
    purchaseQuantity: 4,
    onActivate: googleSearch,
    icon: FaGoogle
  },
  {
    id: "whisper_highlight_correct",
    difficultyWeight: 5,
    label: "Highlighter",
    description: "10 seconds to type frantically while correct letters are highlighted",
    purchaseCost: 6,
    purchaseQuantity: 5,
    onActivate: startHighlight,
    icon: FaHighlighter
  }
]
