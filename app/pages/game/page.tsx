"use client";

import G, { gameState, globalDefaults } from "../../global";
import { useEffect, useRef, useState } from 'react';
import CategoryTag from '../../components/CategoryTag';
import AnswerBox from '../../components/AnswerBox';
import { makePlaceholderText, getChoppedPlaceholder, getAnswerCorrect } from '../../helpers/util';
import WongoPointsBar from "../../components/WongoPointsBar";
import { useRouter } from "next/navigation";
import WikiPointsBar from "../../components/WikiPointsBar";
import { WikiArticle } from "../../services/wikiservice";
import gameStateService, { saveGameStateToFirebase } from "@/app/services/gameStateService";
import WongoWhisperSection from "@/app/components/WongoWhisperSection";
import ArticleSkeleton from "@/app/components/ArticleSkeleton";
import PictureBar from "@/app/components/PictureBar";
import soundManager from "@/app/managers/soundManager";
import FadeTransition from "@/app/components/FadeTransition";

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

  const [whisperCounts, setWhisperCounts] = useState<Record<string, number>>(globalDefaults.startingWongoWhispers);
  const [whispersUsed, setWhispersUsed] = useState(0);

  const hasInitialized = useRef(false);

  const [isTransitioning, setIsTransitioning] = useState(true);


  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    (async () => {
      try {
        await gameStateService.updateGameStateFromStorage();

        const isNewGame = !gameState.isExistingGame || !gameState.currentArticleId;

        if (isNewGame) {
          gameState.isExistingGame = true;
          await retrieveAndUpdateRandomArticle();
          return;
        }

        if (!gameState.currentArticleId) {
          await retrieveAndUpdateRandomArticle();
        } else {
          await retrieveAndUpdateArticleById(gameState.currentArticleId);
        }

        // Sync gameState with React state
        setWhisperCounts(gameState.whispers ?? {});
        setLevelsCompleted(gameState.levelsCompleted ?? []);
        setPlaceholder(gameState.currentPlaceholder ?? "");
        setWongoPoints(gameState.wongos ?? globalDefaults.startingWongos);
        setWikiPoints(gameState.wikis ?? 0);

      } catch (error) {
        console.error("Failed to initialize game:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (article?.normalizedtitle) {
      const newPlaceholder = makePlaceholderText(article.normalizedtitle, "");
      setIsTransitioning(false);
      setPlaceholder(newPlaceholder);
    }
  }, [article]);

  useEffect(() => {
    if (wongoPoints <= 0) {
      gameState.levelsCompleted == 0;
      gameState.wikis = globalDefaults.startingWikis;
      gameState.wongos = 0;
      gameState.whispers = globalDefaults.startingWongoWhispers;
      gameState.currentPlaceholder = "";
      gameState.currentArticleId = "";
      gameState.isExistingGame = false;

      saveGame();

      router.push("/pages/lose");
    }
  }, [wongoPoints]);

  useEffect(() => {
    if (isCorrect) {
      soundManager.playSound("win");

      setTimeout(() => { setIsTransitioning(true); }, G.delayAfterAnswer * 0.6);
      setTimeout(handlePostAnswer, G.delayAfterAnswer);
    } else if (isCorrect === false) // looks dumb but isCorrect can be null
    {
      setTimeout(() => { setIsCorrect(null); }, G.delayAfterAnswer);
      soundManager.playSound("lose");
    }
  }, [isCorrect]);

  useEffect(() => {
    if (wasSkipped) {
      setTimeout(() => { setIsTransitioning(true); }, G.delayAfterSkip * 0.5);
      setTimeout(handlePostAnswer, G.delayAfterSkip);
    }
  }, [wasSkipped]);

  async function handlePostAnswer() {
    saveGame();

    setPlaceholder("");
    setIsCorrect(null);

    if ((levelsCompleted + 1) !== 0 && (levelsCompleted + 1) % 5 === 0) {
      router.push("/pages/shop");
      return;
    }

    await fetch(`/api/updateArticleDifficulty/${article?.pageid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleGuesses: guessCount,
        whispersUsed: whispersUsed
      })
    });

    const response = await fetch('/api/randomArticle');
    const nextArticle: WikiArticle = await response.json();

    chooseNextArticleWithBuffer(nextArticle);
  }

  async function retrieveAndUpdateRandomArticle() {
    const response = await fetch('/api/randomArticle');
    const nextArticle: WikiArticle = await response.json() as WikiArticle;

    chooseNextArticleWithBuffer(nextArticle);
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
    if (guess === "" || isCorrect) {
      return;
    }

    setGuessCount(guessCount + 1);

    if (getAnswerCorrect(guess, article?.normalizedtitle || "")) {
      setLevelsCompleted(levelsCompleted + 1);
      setWongoPoints(wongoPoints + Math.max(10 - guessCount, 1));
      setWikiPoints(wikiPoints + globalDefaults.wikiPointsPerArticle);
      setIsCorrect(true);
    } else {
      setWongoPoints(wongoPoints - 3);
      setIsCorrect(false);
    }

    setGuess("");
  }

  function onGuessChange(newGuess: string) {
    soundManager.playSound('hover');
    setGuess(newGuess);
  }

  function chooseNextArticleWithBuffer(article: WikiArticle | null) {
    setPurchasedPhoto(false);
    setGuessCount(0);
    setWasSkipped(false);

    setTimeout(() => setArticle(article), globalDefaults.transitionDuration);
  }

  function saveGame() {
    gameState.wikis = wikiPoints;
    gameState.wongos = wongoPoints;
    gameState.levelsCompleted = levelsCompleted;
    gameState.currentArticleId = article?.pageid || "";
    gameState.currentPlaceholder = placeholder || "";

    saveGameStateToFirebase();
  }

  return (
    <>
      <section className={`fixed top-0 left-0 w-screen h-full -z-10 pb-5 pointer-events-none transition-colors duration-300 ${wasSkipped === true ? "bg-cyan-900" : isCorrect === null ? "bg-transparent" : isCorrect ? "bg-green-800" : "bg-red-800"}`}>
      </section>
      <div className="flex justify-center">
        <div className="flex-col justify-center mt-2 w-screen md:w-2/3 p-10 md:p-0">
          <h1 className="text-black dark:text-white text-bold text-2xl mb-5">Level {levelsCompleted + 1}</h1>
          <FadeTransition isTransitioning={!isTransitioning} />
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

              <AnswerBox guess={guess} onAnswerAction={handleAnswerSubmit} onChangeAction={g => onGuessChange(g)} placeholder={placeholder?.split("").join(" ")} answer={article?.normalizedtitle} />

              <div className="flex justify-center justify-items-center mt-10">
                <a className="hover:bg-green-600 dark:hover:bg-green-950 hover:text-white rounded-sm p-2 bg-green-300 text-black block text-center w-full md:w-1/2 lg:w-1/3 select-none hover:cursor-pointer" onClick={() => { handleAnswerSubmit(); soundManager.playSound('click'); }} onMouseEnter={() => { soundManager.playSound('hover') }}>Guess</a>
              </div>

              <WongoWhisperSection context={{
                isTransitioning: isTransitioning,
                articleTitle: article.normalizedtitle,
                placeholder: placeholder ?? "",
                wongoPoints: wongoPoints,
                wikiPoints: wikiPoints,
                setWongoPointsAction: setWongoPoints,
                setWikiPointsAction: setWikiPoints,
                setIsCorrectAction: setIsCorrect,
                setPlaceholderAction: setPlaceholder,
                setWasSkippedAction: setWasSkipped,
                setLevelsCompletedAction: setLevelsCompleted,
                levelsCompleted: levelsCompleted,
                wasSkipped: wasSkipped,
                purchasedPhoto: purchasedPhoto,
                setPurchasedPhoto: setPurchasedPhoto,
                whisperCounts: whisperCounts,
                whispersUsed: whispersUsed,
                setWhispersUsedAction: setWhispersUsed,
                setWhisperCountsAction: setWhisperCounts,
                isCorrect: isCorrect ?? false,
                hasPhoto: !!article?.originalimage
              }} />

              <section>
                <h1 className="text-black dark:text-white mt-10 select-none">Categories</h1>
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
            isTransitioning && (
              <ArticleSkeleton />
            )
          }
        </div>
      </div>
    </>
  )
}
