"use client";

import G, { gameState, globalDefaults } from "../../global";
import { useEffect, useState } from 'react';
import CategoryTag from '../../components/CategoryTag';
import AnswerBox from '../../components/AnswerBox';
import { makePlaceholderText, getAnswerCorrectness } from '../../helpers/util';
import CategorySkeleton from "../../components/CategorySkeleton";
import WongoPointsBar from "../../components/WongoPointsBar";
import { useRouter } from "next/navigation";
import WongoPoint from "../../components/WongoPoint";
import WikiPointsBar from "../../components/WikiPointsBar";
import { WikiArticle } from "../../services/wikiservice";

export default function Game() {
  const router = useRouter();

  const [article, setArticle] = useState<WikiArticle | null>(null);

  const [placeholder, setPlaceholder] = useState<string | undefined>(undefined);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [wongoPoints, setWongoPoints] = useState<number>(G.startingWongos); // Wongo points are like HP
  const [wikiPoints, setWikiPoints] = useState<number>(0); // These are just normal ass points

  const [guess, setGuess] = useState<string>("");
  const [guessCount, setGuessCount] = useState<number>(0);

  const [wasSkipped, setWasSkipped] = useState<boolean>(false);

  const [levelsCompleted, setLevelsCompleted] = useState<number>(0);

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
    if (!!article) {
      setGuessCount(0);
      setPlaceholder(makePlaceholderText(article?.normalizedtitle || "", ""));
      setIsCorrect(null);
      setWasSkipped(false);
    }
  }, [article]);

  useEffect(() => {
    if (isCorrect) {
      setTimeout(handlePostAnswer, G.delayAfterAnswer);
    }
  }, [isCorrect]);

  useEffect(() => {
    if (wasSkipped) {
      setTimeout(handlePostAnswer, G.delayAfterSkip);
    }
  }, [wasSkipped]);

  function handlePostAnswer() {
    setPlaceholder("");
    setTimeout(() => {
      if (isCorrect || wasSkipped) {
        retrieveAndUpdateRandomArticle();
      }
    }, 100)
  }

  async function retrieveAndUpdateRandomArticle() {
    const response = await fetch('/api/randomArticle');
    const article: WikiArticle = await response.json() as WikiArticle;

    setArticle(article);
  }

  async function retrieveAndUpdateArticleById(articleId: string) {
    if (!articleId) {
      console.error("Article ID was empty!");
      return;
    }

    const response = await fetch(`/api/article/${articleId}`);
    const article: WikiArticle = await response.json() as WikiArticle;

    setArticle(article);
  }

  function handleAnswerSubmit() {
    if (guess === "") {
      return;
    }

    setGuessCount(guessCount + 1);

    if (getAnswerCorrectness(guess, article?.normalizedtitle || "") > G.correctnessThreshold) {
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

  function onRevealLetter() {
    const newPlaceholder = makePlaceholderText(article?.normalizedtitle ?? "", placeholder ?? "") ?? undefined;

    if (newPlaceholder?.replace(/\u00A0/g, " ") == article?.normalizedtitle) {
      setIsCorrect(true);
      return;
    }

    setWongoPoints(wongoPoints - 1);
    setPlaceholder(newPlaceholder);
  }

  function onSkip() {
    setWasSkipped(true);
    setPlaceholder(article?.normalizedtitle?.replace(/\s/g, "\u00A0"));
    setWongoPoints(wongoPoints - 3);
  }

  function onGuessChange(newGuess: string) {
    setGuess(newGuess);
  }

  function getGuessForDisplay() {
    return `${guess} `;
  }

  function getChoppedPlaceholder() {
    return placeholder?.substring(guess.length, placeholder.length)
  }

  return (
    <section className={`w-screen h-screen transition-colors duration-300 ${wasSkipped === true ? "bg-cyan-900" : isCorrect === null ? "bg-background" : isCorrect ? "bg-green-800" : "bg-red-800"}`}>
      <div className="flex justify-center">
        <div className="flex-col justify-center mt-2 md:mt-20 w-screen md:w-2/3 p-10 md:p-0">
          <WikiPointsBar points={wikiPoints} />
          <WongoPointsBar points={wongoPoints} />
          {!!article?.normalizedtitle && (<article>
            {!isCorrect && <div className="text-center text-5xl mb-20"><h1 className="inline text-cyan-500">{getGuessForDisplay()?.split("").join(' ').replace(/\s/g, "\u00A0")}</h1><h1 className="inline">{getChoppedPlaceholder()?.split("").join(' ')}</h1></div>}
            {isCorrect && <h1 className="text-6xl mb-20 text-center text-green-400">{article?.normalizedtitle}</h1>}

            {<AnswerBox guess={guess} onAnswerAction={handleAnswerSubmit} onChangeAction={g => onGuessChange(g)} placeholder={placeholder?.split("").join("\u00A0")} answer={article?.normalizedtitle} />}
            <div className="flex justify-center justify-items-center mt-10">
              <a className="hover:bg-green-600 dark:hover:bg-green-950 hover:text-white rounded-sm p-2 bg-green-300 text-black block text-center w-full md:w-1/2 lg:w-1/3 select-none" onClick={handleAnswerSubmit}>Guess</a>
            </div>

            <hr className="text-gray-700 mt-10" />

            <div className="flex justify-center justify-items-center mt-10">
              <a className="hover:bg-cyan-600 dark:hover:bg-cyan-950 hover:text-white rounded-sm p-2 bg-cyan-300 text-black block text-center w-full md:w-1/2 lg:w-1/3 select-none" onClick={onRevealLetter}>Reveal Letter</a>
              <span className="inline my-auto ml-5"><WongoPoint /></span><span className="inline my-auto ml-5 font-bold">x1</span>
            </div>
            <div className="flex justify-center justify-items-center mt-10">
              <a className="hover:bg-cyan-600 dark:hover:bg-cyan-950 hover:text-white rounded-sm p-2 bg-cyan-300 text-black block text-center w-full md:w-1/2 lg:w-1/3 select-none" onClick={onSkip}>Skip</a>
              <span className="inline my-auto ml-5"><WongoPoint /></span><span className="inline my-auto ml-5 font-bold">x3</span>
            </div>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
              {
                Array.isArray(article?.categories) && article?.categories?.map(c => {
                  return <CategoryTag key={c} title={c} />;
                })
              }
            </div>
          </article>)
          }
          {
            !article?.normalizedtitle && (
              <article>
                <h1 className="text-center text-5xl mb-20 animate-shimmer-text">_ _ _ _ _ _ _ _ _</h1>

                <AnswerBox guess={guess} onChangeAction={g => onGuessChange(g)} onAnswerAction={handleAnswerSubmit} placeholder="_ _ _ _ _ _ _ _ _" answer={""} />

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
                  {
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(k => {
                      return (<CategorySkeleton key={k} />)
                    })
                  }
                </div>

              </article>
            )
          }
        </div>
      </div>
    </section>
  )
}
