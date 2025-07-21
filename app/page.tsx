"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import gameStateService from "./services/gameStateService"
import WikiWongosInteractiveLogo from "./components/WikiWongosInteractiveLogo";
import { gameState, initialGameState, setGameState } from "./global";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isExisting, setIsExisting] = useState(false);

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
    setGameState(initialGameState);
  }

  return (
    <div id="big-ass-container-dayum" className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pt-0 md:p-0 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <WikiWongosInteractiveLogo />
        <h1 className="text-5xl uppercase bold font-libertine text-center">Wiki Wongos</h1>

        {
          isExisting && (
            <section className="flex flex-col w-full">
              <Link href="/pages/game" className="flex py-3 px-3 w-full bg-white text-black text-center rounded-4xl mb-5">
                <span className="text-xl uppercase bold w-full">Continue</span>
              </Link>
              <a className="flex py-3 px-3 w-full text-black text-center rounded-4xl bg-red-500" onClick={startNewGame}>
                <span className="text-xl uppercase bold w-full text-white">New Game</span>
              </a>            
            </section>
          )
        }

        {
          !isExisting && (
            <Link href="/pages/game" className="py-3 px-3 w-full bg-white text-black text-center rounded-4xl">
              <span className="text-xl uppercase bold">Play</span>
            </Link>
          )
        }
      </main>
    </div>
  );
}
