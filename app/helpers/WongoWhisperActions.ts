import { ReactNode } from "react";
import { makePlaceholderText, revealSingleLetterInPlaceholder, revealWordInPlaceholder } from "./util";
import { FaA, FaArrowRight, FaPhotoFilm, FaW } from "react-icons/fa6";
import { IconType } from "react-icons";

export type WongoWhisper = {
  id: string;
  label: string;
  cost: number;
  purchaseCost?: number,
  description?: string,
  onActivate: (whisper: WongoWhisper, context: WongoWhisperContext) => void;
  icon: IconType;
}

export type WongoWhisperContext = {
  isTransitioning: bool;
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
  setPurchasedPhoto: any;
  purchasedPhoto: boolean;
  levelsCompleted: number;
  hasPhoto: boolean;
}

function revealLetter(whisper: WongoWhisper, context: WongoWhisperContext) {
  if (context.isTransitioning)
  {
    return;
  }

  const newPlaceholder = revealSingleLetterInPlaceholder(context.articleTitle, context.placeholder);

  context.setWongoPointsAction(context.wongoPoints - whisper.cost);

  if (newPlaceholder === context.articleTitle) {
    context.setWikiPointsAction(context.wikiPoints + 1);
    context.setLevelsCompletedAction(context.levelsCompleted + 1);
    context.setIsCorrectAction(true);
    return;
  }

  context.setPlaceholderAction(newPlaceholder ?? "");
}

function revealWord(whisper: WongoWhisper, context: WongoWhisperContext) {
  if (context.isTransitioning)
  {
    return;
  }
  const newPlaceholder = revealWordInPlaceholder(context.articleTitle, context.placeholder);

  context.setWongoPointsAction(context.wongoPoints - whisper.cost);

  if (newPlaceholder === context.articleTitle) {
    context.setWikiPointsAction(context.wikiPoints + 1);
    context.setLevelsCompletedAction(context.levelsCompleted + 1);
    context.setIsCorrectAction(true);
    return;
  }

  context.setPlaceholderAction(newPlaceholder ?? "");
}

function onSkip(whisper: WongoWhisper, context: WongoWhisperContext) {
  if (context.isTransitioning)
  {
    return;
  }

  context.setWasSkippedAction(true);
  context.setLevelsCompletedAction(context.levelsCompleted + 1);
  context.setPlaceholderAction(context.articleTitle);
  context.setWongoPointsAction(context.wongoPoints - whisper.cost);
}

function buyPicture(whisper: WongoWhisper, context: WongoWhisperContext)
{
  if(context.purchasedPhoto)
  {
    return;
  }
  
  context.setPurchasedPhoto(true);
  context.setWongoPointsAction(context.wongoPoints - whisper.cost);
}

export const allWongoWhispers: WongoWhisper[] = [
  {
    id: "whisper_reveal_letter",
    label: "Reveal Letter",
    cost: 1,
    onActivate: revealLetter,
    icon: FaA
  },
  {
    id: "whisper_reveal_word",
    label: "Reveal Word",
    description: "Reveal a whole word for 8 wongo points!",
    cost: 8,
    purchaseCost: 5,
    onActivate: revealWord,
    icon: FaW
  },
  {
    id: "whisper_skip",
    label: "Skip",
    description: "Skip an article!",
    cost: 2,
    purchaseCost: 1,
    onActivate: onSkip,
    icon: FaArrowRight
  },
  {
    id: "whisper_buy_picture",
    label: "Buy Picture",
    description: "Purchase a picture from the Wikipedia article to view at any time for 8 wongo points. Can only purchase 1 picture per article.",
    cost: 8,
    purchaseCost: 8,
    onActivate: buyPicture,
    icon: FaPhotoFilm
  }
]
