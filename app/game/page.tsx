"use client";

import G from "../global";
import { useEffect, useState } from 'react';
import CategoryTag from '../components/CategoryTag';
import AnswerBox from '../components/AnswerBox';
import { makePlaceholderText, getAnswerCorrectness } from '../helpers/util';
import CategorySkeleton from "../components/CategorySkeleton";

export default function Game() {
  const [title, setTitle] = useState<string | null>(null);
  const [categories, setCategories] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

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
    if (getAnswerCorrectness(answer, title || "") > 0.9) {
      setIsCorrect(true);
    } else {
      setPlaceholder(makePlaceholderText(title || "", placeholder ?? "") ?? null);
      setIsCorrect(false);
    }
  }

  return (
    <section className={`w-screen h-screen transition-colors duration-300 ${isCorrect === null ? "bg-background" : isCorrect ? "bg-green-800" : "bg-red-800"}`}>
      <div className="flex justify-center">
        <div className="flex-col justify-center mt-5 md:mt-20 w-screen md:w-2/3 p-10 md:p-0">
          {!!title && (<article>
            {!isCorrect && <h1 className="text-center text-5xl mb-20">{placeholder?.split("").join(' ')}</h1>}
            {isCorrect && <h1 className="text-6xl mb-20 text-center text-green-400">{title}</h1>}

            <h1 className="uppercase font-bold mb-3">Guess</h1>
            {placeholder && title && <AnswerBox onAnswer={handleAnswerSubmit} placeholder={placeholder?.split("").join("\u00A0")} answer={title} />}

            <h1 className="uppercase font-bold mt-10">Categories</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
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
                <h1 className="text-center text-5xl mb-20">_ _ _ _ _ _ _ _ _</h1>

                <h1 className="uppercase font-bold mb-3">Guess</h1>
                <AnswerBox onAnswer={()=>{}} placeholder="_ _ _ _ _ _ _ _ _" answer={""} />

                <h1 className="uppercase font-bold mt-10">Categories</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
                    { 
                      [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(k => { 
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
