"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import gameStateService from "./services/gameStateService"
import WikiWongosInteractiveLogo from "./components/WikiWongosInteractiveLogo";
import { gameState, initialGameState, setGameState } from "./global";
import FadeTransition from "./components/FadeTransition";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    setIsClient(true);

    const init = async () => {
      await gameStateService.updateGameStateFromStorage();
      setIsExisting(gameState.isExistingGame);
    };

    init();
  }, []);

  useEffect(() => {
    setIsExisting(gameState.isExistingGame);
  }, [gameState.isExistingGame]);

  if (!isClient) {
    return <div style={{ width: "100%", height: "100%" }} />;
  }

  function startNewGame()
  {
    const initialState = { ...initialGameState };
    initialState.forceNewGame = true;
    setGameState(initialState);
    fadeAndPlay();
  }

  function fadeAndPlay()
  {
    setIsTransitioning(false);
    setTimeout(()=>router.push("/pages/game"), 500);
  }

  return (
    <div id="big-ass-container-dayum" className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pt-0 md:p-0 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <WikiWongosInteractiveLogo />
        <FadeTransition isTransitioning={isTransitioning} />
        <h1 className="text-black dark:text-white text-5xl uppercase bold font-libertine text-center">Wiki Wongos</h1>

        {
          isExisting && (
            <section className="flex flex-col w-full">
              <a onClick={fadeAndPlay} className="flex cursor-pointer select-none py-3 px-3 w-full bg-black dark:bg-white text-white dark:text-black text-center rounded-4xl mb-5">
                <span className="text-xl uppercase bold w-full">Continue</span>
              </a>
              <a className="flex py-3 px-3 w-full text-black text-center rounded-4xl bg-red-500 select-none cursor-pointer" onClick={startNewGame}>
                <span className="text-xl uppercase bold w-full text-white">New Game</span>
              </a>            
            </section>
          )
        }

        {
          !isExisting && (
            <Link href="/pages/game" className="py-3 px-3 w-full dark:bg-white bg-black dark:text-black text-white text-center rounded-4xl">
              <span className="text-xl uppercase bold">Play</span>
            </Link>
          )
        }
      </main>
    </div>
  );
}
