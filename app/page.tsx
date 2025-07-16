"use client";

import Link from "next/link";
import { useEffect } from "react";
import gameStateService from "./services/gameStateService"
import WikiWongosInteractiveLogo from "./components/WikiWongosInteractiveLogo";

export default function Home() {
  useEffect(() => {
    gameStateService.initializeGameState();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <WikiWongosInteractiveLogo />
        <h1 className="text-5xl uppercase bold font-libertine">Wiki Wongos</h1>
        <Link href="/pages/game" className="py-3 px-3 w-full bg-white text-black text-center rounded-4xl">
          <span className="text-xl uppercase bold">Play</span>
        </Link>        
      </main>
    </div>
  );
}
