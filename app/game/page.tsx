"use client";

import G from "../global";
import { useEffect, useState } from 'react';
import CategoryTag from '../components/CategoryTag';
import AnswerBox from '../components/AnswerBox';
import { makePlaceholderText, getAnswerCorrectness } from '../helpers/util';
import CategorySkeleton from "../components/CategorySkeleton";
import WongoPointsBar from "../components/WongoPointsBar";
import { useRouter } from "next/navigation";
import WongoPoint from "../components/WongoPoint";

export default function Game() {
  const router = useRouter();

  const [title, setTitle] = useState<string | null>(null);
  const [categories, setCategories] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wongoPoints, setWongoPoints] = useState<number>(100);

  useEffect(() => {
    (async function fetchArticle() {
      try {
        getNewTitle();
      } catch (error) {
        console.error('Failed to fetch article: ', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (wongoPoints <= 0)
    {
      router.push("/lose");
    }
  }, [wongoPoints]);

  useEffect(() => {
    (async function fetchCategories() {
      if (!title) {
        return [];
      }
      try {
        const response = await fetch(`/api/categories?title=${title}`);
        const data = await response.json();

        setCategories(data.categories ?? []);
      } catch (error) {
        console.error('Failed to fetch categories: ', error);
      }
    })();
  }, [title]);

  useEffect(() => {
    setTimeout(handlePostAnswer, G.delayAfterAnswer);
  }, [isCorrect]);

  useEffect(() => {
    if (!!placeholder && !placeholder.includes('_')) {
      setIsCorrect(true);
      return;
    }
  }, [placeholder]);

  function handlePostAnswer() {
    if (isCorrect) {
      getNewTitle();
    }
    setIsCorrect(null);
  }

  async function getNewTitle() {
    const response = await fetch('/api/randomArticle');
    const data = await response.json();
    setPlaceholder(makePlaceholderText(data.title || "", ""));
    setTitle(data.title);
  }

  function handleAnswerSubmit(answer: string) {
    if (getAnswerCorrectness(answer, title || "") > G.correctnessThreshold) {
      setWongoPoints(wongoPoints + 3);
      setIsCorrect(true);
    } else {
      setWongoPoints(wongoPoints - 1);
      setPlaceholder(makePlaceholderText(title || "", placeholder ?? "") ?? null);
      setIsCorrect(false);
    }
  }

  function onRevealLetter() {
    setWongoPoints(wongoPoints - 1);
    setPlaceholder(makePlaceholderText(title || "", placeholder ?? "") ?? null);
  }

  function onSkip()
  {
    setWongoPoints(wongoPoints - 3);
    setIsCorrect(false);
    getNewTitle();
  }

  return (
    <section className={`w-screen h-screen transition-colors duration-300 ${isCorrect === null ? "bg-background" : isCorrect ? "bg-green-800" : "bg-red-800"}`}>
      <div className="flex justify-center">
        <div className="flex-col justify-center mt-2 md:mt-20 w-screen md:w-2/3 p-10 md:p-0">
          <WongoPointsBar points={wongoPoints} />
          {!!title && (<article>
            {!isCorrect && <h1 className="text-center text-5xl mb-20">{placeholder?.split("").join(' ')}</h1>}
            {isCorrect && <h1 className="text-6xl mb-20 text-center text-green-400">{title}</h1>}

            {placeholder && title && <AnswerBox onAnswer={handleAnswerSubmit} placeholder={placeholder?.split("").join("\u00A0")} answer={title} />}
            <div className="flex justify-center justify-items-center mt-10">
              <a className="hover:bg-cyan-600 dark:hover:bg-black hover:text-white rounded-sm p-2 bg-cyan-300 text-black block text-center w-full md:w-1/2 lg:w-1/3 select-none" onClick={onRevealLetter}>Reveal Letter</a>
              <span className="inline my-auto ml-5"><WongoPoint /></span><span className="inline my-auto ml-5 font-bold">x1</span>
            </div>
            <div className="flex justify-center justify-items-center mt-10">
              <a className="hover:bg-cyan-600 dark:hover:bg-black hover:text-white rounded-sm p-2 bg-cyan-300 text-black block text-center w-full md:w-1/2 lg:w-1/3 select-none" onClick={onSkip}>Skip</a>
              <span className="inline my-auto ml-5"><WongoPoint /></span><span className="inline my-auto ml-5 font-bold">x3</span>
            </div>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
              {
                Array.isArray(categories) && categories.map(c => {
                  return <CategoryTag key={c} title={c} />;
                })
              }
            </div>
          </article>)
          }
          {
            !title && (
              <article>
                <h1 className="text-center text-5xl mb-20 animate-shimmer-text">_ _ _ _ _ _ _ _ _</h1>

                <AnswerBox onAnswer={() => { }} placeholder="_ _ _ _ _ _ _ _ _" answer={""} />

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
