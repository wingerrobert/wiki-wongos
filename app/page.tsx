"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import gameStateService from "./services/gameStateService"
import WikiWongosInteractiveLogo from "./components/WikiWongosInteractiveLogo";

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    gameStateService.initializeGameState();
  }, []);
  
  if (!isClient)
  {
    return <div style={{ width: "100%", height: "100%" }} />;
  }

  return (
    <div id="big-ass-container-dayum" className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pt-0 md:p-0 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <WikiWongosInteractiveLogo />
        <h1 className="text-5xl uppercase bold font-libertine text-center">Wiki Wongos</h1>
        <Link href="/pages/game" className="py-3 px-3 w-full bg-white text-black text-center rounded-4xl">
          <span className="text-xl uppercase bold">Play</span>
        </Link>        
      </main>
    </div>
  );
}
