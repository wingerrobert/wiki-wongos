import { revealSingleLetterInPlaceholder, revealWordInPlaceholder } from "./util";
import { FaA, FaArrowRight, FaPhotoFilm, FaW } from "react-icons/fa6";
import { IconType } from "react-icons";

export type WongoWhisper = {
  id: string;
  label: string;
  purchaseCost: number,
  purchaseQuantity: number, // how many does purchasing get you?
  description?: string,
  onActivate: (whisper: WongoWhisper, context: WongoWhisperContext) => void;
  icon: IconType;
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
  purchasedPhoto: boolean;
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

  useWhisper(whisper.id, context.whisperCounts, context.setWhisperCountsAction, context.whispersUsed, context.setWhispersUsedAction); 

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

  useWhisper(whisper.id, context.whisperCounts, context.setWhisperCountsAction, context.whispersUsed, context.setWhispersUsedAction); 

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

  useWhisper(whisper.id, context.whisperCounts, context.setWhisperCountsAction, context.whispersUsed, context.setWhispersUsedAction); 
}

function buyPicture(whisper: WongoWhisper, context: WongoWhisperContext) {
  if (context.purchasedPhoto || context.whisperCounts[whisper.id] <= 0) {
    return;
  }

  context.setPurchasedPhoto(true);

  useWhisper(whisper.id, context.whisperCounts, context.setWhisperCountsAction, context.whispersUsed, context.setWhispersUsedAction); 
}

function useWhisper(whisperId: string, whisperCounts: Record<string, number>, setWhisperCounts: any, whispersUsed: number, setWhispersUsed: any)
{
  if (!whisperCounts[whisperId] || whisperCounts[whisperId] - 1 < 0)
  {
    return;
  }

  setWhispersUsed(whispersUsed + 1);
  setWhisperCounts({ ...whisperCounts, [whisperId]: whisperCounts[whisperId] - 1 });
}

export const allWongoWhispers: WongoWhisper[] = [
  {
    id: "whisper_reveal_letter",
    label: "Reveal Letter",
    purchaseCost: 1,
    purchaseQuantity: 10,
    onActivate: revealLetter,
    icon: FaA
  },
  {
    id: "whisper_reveal_word",
    label: "Reveal Word",
    description: "Reveal a whole word for 8 wongo points!",
    purchaseCost: 5,
    purchaseQuantity: 6,
    onActivate: revealWord,
    icon: FaW
  },
  {
    id: "whisper_skip",
    label: "Skip",
    description: "Skip an article!",
    purchaseCost: 3,
    purchaseQuantity: 4,
    onActivate: onSkip,
    icon: FaArrowRight
  },
  {
    id: "whisper_buy_picture",
    label: "Buy Picture",
    description: "Purchase a picture from the Wikipedia article to view at any time for 8 wongo points. Can only purchase 1 picture per article.",
    purchaseCost: 10,
    purchaseQuantity: 4,
    onActivate: buyPicture,
    icon: FaPhotoFilm
  }
]
