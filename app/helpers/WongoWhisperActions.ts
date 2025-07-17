import { ReactNode } from "react";
import { makePlaceholderText, revealSingleLetterInPlaceholder, revealWordInPlaceholder } from "./util";
import { FaA, FaArrowRight, FaPhotoFilm, FaW } from "react-icons/fa6";
import { IconType } from "react-icons";

export type WongoWhisper = {
  id: string;
  label: string;
  cost: number;
  onActivate: (whisper: WongoWhisper, context: WongoWhisperContext) => void;
  icon: IconType;
}

export type WongoWhisperContext = {
  articleTitle: string;
  placeholder: string;
  wongoPoints: number;
  wikiPoints: number;
  setWongoPointsAction: any;
  setWikiPointsAction: any;
  setIsCorrectAction: any;
  setPlaceholderAction: any;
  setWasSkippedAction: any;
  setPurchasedPhoto: any;
  purchasedPhoto: boolean;
  hasPhoto: boolean;
}

function revealLetter(whisper: WongoWhisper, context: WongoWhisperContext) {
  const newPlaceholder = revealSingleLetterInPlaceholder(context.articleTitle, context.placeholder);

  context.setWongoPointsAction(context.wongoPoints - whisper.cost);

  if (newPlaceholder === context.articleTitle) {
    context.setWikiPointsAction(context.wikiPoints + 1);
    context.setIsCorrectAction(true);
    return;
  }

  context.setPlaceholderAction(newPlaceholder ?? "");
}

function revealWord(whisper: WongoWhisper, context: WongoWhisperContext) {
  const newPlaceholder = revealWordInPlaceholder(context.articleTitle, context.placeholder);

  context.setWongoPointsAction(context.wongoPoints - whisper.cost);

  if (newPlaceholder === context.articleTitle) {
    context.setWikiPointsAction(context.wikiPoints + 1);
    context.setIsCorrectAction(true);
    return;
  }

  context.setPlaceholderAction(newPlaceholder ?? "");
}

function onSkip(whisper: WongoWhisper, context: WongoWhisperContext) {
  context.setWasSkippedAction(true);
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
    cost: 8,
    onActivate: revealWord,
    icon: FaW
  },
  {
    id: "whisper_skip",
    label: "Skip",
    cost: 2,
    onActivate: onSkip,
    icon: FaArrowRight
  },
  {
    id: "whisper_buy_picture",
    label: "Buy Picture",
    cost: 8,
    onActivate: buyPicture,
    icon: FaPhotoFilm
  }
]
