"use client";

import G, { gameState, globalDefaults, initialGameState, setGameState } from "../../global";
import { useEffect, useRef, useState } from 'react';
import CategoryTag from '../../components/CategoryTag';
import AnswerBox from '../../components/AnswerBox';
import { makePlaceholderText, getChoppedPlaceholder, getAnswerCorrect, getChoppedGuess } from '../../helpers/util';
import WongoPointsBar from "../../components/WongoPointsBar";
import { useRouter } from "next/navigation";
import WikiPointsBar from "../../components/WikiPointsBar";
import { initializeWikiService, WikiArticle } from "../../services/wikiservice";
import gameStateService, { initializePlayerDocument, saveGameStateToFirebase } from "@/app/services/gameStateService";
import WongoWhisperSection from "@/app/components/WongoWhisperSection";
import ArticleSkeleton from "@/app/components/ArticleSkeleton";
import PictureBar from "@/app/components/PictureBar";
import soundManager from "@/app/managers/soundManager";
import FadeTransition from "@/app/components/FadeTransition";
import ExtractBar from "@/app/components/ExtractBar";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import GoogleSearchUI from "@/app/components/GoogleSearchUI";

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

  const [isGoogling, setIsGoogling] = useState(false);

  const [purchasedPhoto, setPurchasedPhoto] = useState(false);
  const [purchasedExtract, setPurchasedExtract] = useState(false);

  const [whisperCounts, setWhisperCounts] = useState<Record<string, number>>(globalDefaults.startingWongoWhispers);
  const [whispersUsed, setWhispersUsed] = useState(0); // Just a note, this isn't 1 -> 1 accurate as some whispers are weighted heavier in this count.

  const hasInitialized = useRef(false);

  const [isTransitioning, setIsTransitioning] = useState(true);

  const [isHighlighting, setIsHighlighting] = useState(false);


  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    (async () => {
      try {
        if (levelsCompleted !== 0 && levelsCompleted % globalDefaults.levelsBeforeStore === 0 && !gameState.justLeftShop)
        {
          return;
        }

        if (gameState.justLeftShop)
        {
          gameState.justLeftShop = false;
        }

        if (!gameState.forceNewGame) {
          await gameStateService.updateGameStateFromStorage();
        }

        gameState.forceNewGame = false;
        const isNewGame = !gameState.isExistingGame || !gameState.currentArticleId;

        if (isNewGame) {
          setGameState(initialGameState);
          await initializePlayerDocument();
          console.log("gameState: ", gameState);
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
        setLevelsCompleted(gameState.levelsCompleted ?? 0);
        setPlaceholder(gameState.currentPlaceholder ?? "");
        setWongoPoints(gameState.wongos ?? globalDefaults.startingWongos);
        setWikiPoints(gameState.wikis ?? 0);

      } catch (error) {
        console.error("Failed to initialize game:", error);
      }
    })();
  }, []);


  useEffect(() => {
    if (article?.normalizedtitle && article.pageid) {
      const alreadyIncluded = gameState.previousArticleIds?.includes(article.pageid);
      const updatedIds = alreadyIncluded
        ? gameState.previousArticleIds
        : [...gameState.previousArticleIds, article.pageid];

      setGameState({ ...gameState, previousArticleIds: updatedIds });

      saveGameStateToFirebase();

      setWhispersUsed(0);
      const newPlaceholder = makePlaceholderText(article.normalizedtitle, "");
      setIsTransitioning(false);
      setPlaceholder(newPlaceholder);
    }
  }, [article]);

  useEffect(() => {
    if (wongoPoints <= 0) {
      setPlaceholder(article?.normalizedtitle);

      gameState.levelsCompleted == 0;
      gameState.wikis = globalDefaults.startingWikis;
      gameState.wongos = 0;
      gameState.whispers = globalDefaults.startingWongoWhispers;
      gameState.currentPlaceholder = "";
      gameState.currentArticleId = "";
      gameState.isExistingGame = false;

      saveGame();

      setTimeout(() => { router.push("/pages/lose"); }, G.delayAfterSkip);
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

    if ((levelsCompleted + 1) !== 0 && (levelsCompleted + 1) % globalDefaults.levelsBeforeStore === 0) {
      setTimeout(() => { router.push("/pages/shop"); }, 500);
    }

    setPlaceholder("");
    setIsCorrect(null);

    await fetch(`/api/updateArticleDifficulty/${article?.pageid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleGuesses: guessCount,
        whispersUsed: whispersUsed
      })
    });

    const response = await fetch(`/api/randomArticle?playerId=${gameState.playerId}`);
    const nextArticle: WikiArticle = await response.json();

    chooseNextArticleWithBuffer(nextArticle);
  }

  async function retrieveAndUpdateRandomArticle() {
    const response = await fetch(`/api/randomArticle?playerId=${gameState.playerId}`);
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
      setWongoPoints(wongoPoints + globalDefaults.wongoPointsPerArticle);
      setWikiPoints(wikiPoints + globalDefaults.wikiPointsPerArticle);
      setIsCorrect(true);
    } else {
      setWongoPoints(wongoPoints - 1);
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
    setPurchasedExtract(false);
    setGuessCount(0);
    setWasSkipped(false);

    setTimeout(() => setArticle(article), globalDefaults.transitionDuration);
  }

  function startGoogling() {
    if (isGoogling) {
      return;
    }

    setIsGoogling(true);

    setTimeout(() => { setIsGoogling(false) }, 10000);
  }

  function startHighlight() {
    if (isHighlighting) {
      return;
    }

    setIsHighlighting(true);

    setTimeout(() => { setIsHighlighting(false) }, 10000);
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
      <input type="hidden" value="HEY YOU, YEAH I KNOW WHAT YOU'RE DOING! YOU'RE CHEATING! A GOD DAMN CHEATER! I couldn't put a HTML comment tag becuase of Next.js restrictions. Also I don't care that you cheated, I had to cheat a ton while developing the game." />
      <section className={`fixed top-0 left-0 w-screen h-full -z-10 pb-5 pointer-events-none transition-colors duration-300 ${wasSkipped === true ? "bg-cyan-900" : isCorrect === null ? "bg-transparent" : isCorrect ? "bg-green-500 dark:bg-green-800" : "bg-red-300 dark:bg-red-800"}`}>
      </section>
      <div className="flex justify-center">
        <div className="flex-col justify-center mt-2 w-screen md:w-2/3 p-10 md:p-0">
          <Link href="/">
            <FaHome className="text-white text-xl md:text-5xl fixed top-5 left-5" />
          </Link>
          <h1 className="text-black dark:text-white text-bold text-2xl mb-5">Level {levelsCompleted + 1}</h1>

          {
            isGoogling && <GoogleSearchUI />
          }

          <FadeTransition isTransitioning={!isTransitioning} />
          <PictureBar src={article?.originalimage?.source} purchased={purchasedPhoto} />
          <ExtractBar purchased={purchasedExtract} extractText={article?.extract ?? ""} articleTitle={article?.normalizedtitle ?? ""} />
          <WikiPointsBar points={wikiPoints} />
          <WongoPointsBar points={wongoPoints} />
          {!!article?.normalizedtitle && (
            <article>
              {
                !isCorrect && (
                  <div className="select-none pointer-events-none text-center text-5xl mb-20">
                    <span className="inline tracking-widest text-cyan-500">{getChoppedGuess(guess, article?.normalizedtitle, isHighlighting)}</span>
                    <span className="inline tracking-widest whitespace-pre-wrap break-keep">{getChoppedPlaceholder(placeholder ?? "", guess)}</span>
                  </div>
                )
              }

              {
                isCorrect && (
                  <div className="select-none pointer-events-none text-center text-5xl mb-20">
                    <pre className="inline tracking-widest whitespace-pre-wrap break-keep text-green-100 dark:text-green-300 text-bold">{article?.normalizedtitle}</pre>
                  </div>
                )
              }

              <AnswerBox guess={guess} onAnswerAction={handleAnswerSubmit} onChangeAction={g => onGuessChange(g)} placeholder={placeholder?.split("").join(" ")} answer={article?.normalizedtitle} />

              <div className="flex justify-center justify-items-center mt-10">
                <a className="hover:bg-green-600 dark:hover:bg-green-950 hover:text-white rounded-sm p-2 bg-black text-white dark:text-white block text-center w-full md:w-1/2 lg:w-1/3 select-none hover:cursor-pointer" onClick={() => { handleAnswerSubmit(); soundManager.playSound('click'); }} onMouseEnter={() => { soundManager.playSound('hover') }}>Guess</a>
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
                setPurchasedExtractAction: setPurchasedExtract,
                startGoogleSearchAction: startGoogling,
                purchasedExtract: purchasedExtract,
                startHighlightAction: startHighlight,
                levelsCompleted: levelsCompleted,
                wasSkipped: wasSkipped,
                purchasedPhoto: purchasedPhoto,
                setPurchasedPhoto: setPurchasedPhoto,
                whisperCounts: whisperCounts,
                whispersUsed: whispersUsed,
                setWhispersUsedAction: setWhispersUsed,
                setWhisperCountsAction: setWhisperCounts,
                isCorrect: isCorrect ?? false,
                hasPhoto: !!article?.originalimage,
                hasExtract: !!article?.extract
              }} />

              <section>
                <h1 className="text-white mt-10 select-none">Categories</h1>
                <div className="my-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
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
