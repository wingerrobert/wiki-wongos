"use client";

import G, { gameState, globalDefaults } from "../../global";
import { useEffect, useState } from 'react';
import CategoryTag from '../../components/CategoryTag';
import AnswerBox from '../../components/AnswerBox';
import { makePlaceholderText, getChoppedPlaceholder, getAnswerCorrect } from '../../helpers/util';
import WongoPointsBar from "../../components/WongoPointsBar";
import { useRouter } from "next/navigation";
import WikiPointsBar from "../../components/WikiPointsBar";
import { WikiArticle } from "../../services/wikiservice";
import { saveGameStateToFirebase } from "@/app/services/gameStateService";
import WongoWhisperSection from "@/app/components/WongoWhisperSection";
import ArticleSkeleton from "@/app/components/ArticleSkeleton";
import PictureBar from "@/app/components/PictureBar";
import soundManager from "@/app/managers/soundManager";

export default function Game() {
  const router = useRouter();

  const [article, setArticle] = useState<WikiArticle | null>(null);

  const [placeholder, setPlaceholder] = useState<string | undefined>(undefined);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [wongoPoints, setWongoPoints] = useState(G.startingWongos); // Wongo points are like HP
  const [wikiPoints, setWikiPoints] = useState(0); // These are just normal ass points

  const [guess, setGuess] = useState("");
  const [guessCount, setGuessCount] = useState(0);

  const [wasSkipped, setWasSkipped] = useState(false);

  const [levelsCompleted, setLevelsCompleted] = useState(0);

  const [purchasedPhoto, setPurchasedPhoto] = useState(false);

  useEffect(() => {
    (async function initGame() {
      try {
        if (!gameState.currentArticleId) {
          await retrieveAndUpdateRandomArticle();
          return;
        }

        await retrieveAndUpdateArticleById(gameState.currentArticleId);

        if (!!gameState.currentPlaceholder) {
          setPlaceholder(gameState.currentPlaceholder);
        }

        if (gameState.wongos !== globalDefaults.startingWongos) {
          setWongoPoints(gameState.wongos);
        }

        if (!!gameState.wikis) {
          setWikiPoints(gameState.wikis);
        }
      } catch (error) {
        console.error('Failed to fetch article: ', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (wongoPoints <= 0) {
      router.push("/pages/lose");
    }
  }, [wongoPoints]);

  useEffect(() => {
    if (isCorrect) {
      soundManager.playSound("win");
      setTimeout(handlePostAnswer, G.delayAfterAnswer);
    }else if (isCorrect === false) // looks dumb but isCorrect can be null
    {
      soundManager.playSound("lose");
    }
  }, [isCorrect]);

  useEffect(() => {
    if (wasSkipped) {
      setTimeout(handlePostAnswer, G.delayAfterSkip);
    }
  }, [wasSkipped]);

  function handlePostAnswer() {
    setPlaceholder("");
    setIsCorrect(null);

    chooseNextArticleWithBuffer(null);

    if (isCorrect || wasSkipped) {
      retrieveAndUpdateRandomArticle();
    }
  }

  async function retrieveAndUpdateRandomArticle() {
    const response = await fetch('/api/randomArticle');
    const article: WikiArticle = await response.json() as WikiArticle;

    chooseNextArticleWithBuffer(article);
  }

  async function retrieveAndUpdateArticleById(articleId: string) {
    if (!articleId) {
      console.error("Article ID was empty!");
      return;
    }

    const response = await fetch(`/api/article/${articleId}`);
    const article: WikiArticle = await response.json() as WikiArticle;
    chooseNextArticleWithBuffer(article);
  }

  function handleAnswerSubmit() {
    if (guess === "") {
      return;
    }

    setGuessCount(guessCount + 1);

    if (getAnswerCorrect(guess, article?.normalizedtitle || "")) {
      setLevelsCompleted(levelsCompleted + 1);
      setWongoPoints(wongoPoints + Math.max(10 - guessCount, 1));
      setWikiPoints(wikiPoints + 1);
      setIsCorrect(true);
    } else {
      setWongoPoints(wongoPoints - 1);
      setIsCorrect(false);
    }

    setGuess("");
  }

  function onGuessChange(newGuess: string) {
    setGuess(newGuess);
  }

  function chooseNextArticleWithBuffer(article: WikiArticle | null) {
    setPurchasedPhoto(false);
    setGuessCount(0);
    setPlaceholder(makePlaceholderText(article?.normalizedtitle || "", ""));
    saveGameStateToFirebase();
    setWasSkipped(false);

    setTimeout(() => setArticle(article), globalDefaults.transitionDuration);
  }

  return (
    <>
      <section className={`fixed top-0 left-0 w-screen h-full -z-10 pb-5 pointer-events-none transition-colors duration-300 ${wasSkipped === true ? "bg-cyan-900" : isCorrect === null ? "bg-transparent" : isCorrect ? "bg-green-800" : "bg-red-800"}`}>
      </section>
      <div className="flex justify-center">
        <div className="flex-col justify-center mt-2 md:mt-20 w-screen md:w-2/3 p-10 md:p-0">

          <PictureBar src={article?.originalimage?.source} purchased={purchasedPhoto} />

          <WikiPointsBar points={wikiPoints} />
          <WongoPointsBar points={wongoPoints} />
          {!!article?.normalizedtitle && (
            <article>
              {
                !isCorrect && (
                  <div className="select-none pointer-events-none text-center text-5xl mb-20">
                    <span className="inline tracking-widest text-cyan-500">{guess}</span>
                    <span className="inline tracking-widest whitespace-pre-wrap break-keep">{getChoppedPlaceholder(placeholder ?? "", guess)}</span>
                  </div>
                )
              }

              {
                isCorrect && (
                  <div className="select-none pointer-events-none text-center text-5xl mb-20">
                    <pre className="inline tracking-widest whitespace-pre-wrap break-keep text-green-300 text-bold">{article?.normalizedtitle}</pre>
                  </div>
                )
              }

              {
                <AnswerBox guess={guess} onAnswerAction={handleAnswerSubmit} onChangeAction={g => onGuessChange(g)} placeholder={placeholder?.split("").join(" ")} answer={article?.normalizedtitle} />
              }

              <div className="flex justify-center justify-items-center mt-10">
                <a className="hover:bg-green-600 dark:hover:bg-green-950 hover:text-white rounded-sm p-2 bg-green-300 text-black block text-center w-full md:w-1/2 lg:w-1/3 select-none hover:cursor-pointer" onClick={()=> { handleAnswerSubmit(); soundManager.playSound('click'); }} onMouseEnter={()=>{soundManager.playSound('hover')}}>Guess</a>
              </div>

              <WongoWhisperSection context={{
                articleTitle: article.normalizedtitle,
                placeholder: placeholder ?? "",
                wongoPoints: wongoPoints,
                wikiPoints: wikiPoints,
                setWongoPointsAction: setWongoPoints,
                setWikiPointsAction: setWikiPoints,
                setIsCorrectAction: setIsCorrect,
                setPlaceholderAction: setPlaceholder,
                setWasSkippedAction: setWasSkipped,
                purchasedPhoto: purchasedPhoto,
                setPurchasedPhoto: setPurchasedPhoto,
                hasPhoto: !!article?.originalimage
              }} />

              <section>
                <h1 className="text-black dark:text-white mt-10">Categories</h1>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
                  {
                    Array.isArray(article?.categories) && article?.categories?.map(c => {
                      return <CategoryTag key={c} title={c} />;
                    })
                  }
                </div>
              </section>
            </article>)
          }
          {
            (!article || !article?.normalizedtitle) && (
              <ArticleSkeleton />
            )
          }
        </div>
      </div>
    </>
  )
}
