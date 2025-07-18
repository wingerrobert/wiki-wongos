'use client';

import WikiPoint from "@/app/components/WikiPoint";
import WikiPointsBar from "@/app/components/WikiPointsBar";
import WongoPoint from "@/app/components/WongoPoint";
import WongoPointsBar from "@/app/components/WongoPointsBar";
import { gameState } from "@/app/global";
import { allWongoWhispers, WongoWhisper } from "@/app/helpers/WongoWhisperActions";
import soundManager from "@/app/managers/soundManager";
import Link from "next/link";
import { useState } from "react";

export default function Shop() {
  const [wikiPoints, setWikiPoints] = useState(gameState.wikis);
  const [wongoPoints, setWongoPoints] = useState(gameState.wongos);

  function purchaseWongoWhisper(whisper: WongoWhisper) {
    if (!whisper.purchaseCost || wikiPoints - whisper.purchaseCost < 0) {
      return;
    }

    setWikiPoints(wikiPoints - whisper.purchaseCost);
    gameState.unlockedWhispers.push(whisper.id);
  }

  function purchaseWikiPoints() {
    if (wikiPoints - 1 < 0) {
      return;
    }

    setWikiPoints(wikiPoints - 1);
    setWongoPoints(wongoPoints + 10);
  }

  return (
    <section className="grid grid-cols-1 justify-center p-5 md:p-0 md:w-1/2 mx-auto mt-10">
      <div className="flex flex-col">
        <div className="flex"><WikiPointsBar points={wikiPoints} /></div>
        <div className="flex"><WongoPointsBar points={wongoPoints} /></div>
      </div>
      <div className="text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 justify-center md:justify-around">
          <div className="mx-auto mb-5 md:mb-0">
            <span className="font-libertine inline text-5xl">WW</span><span className="inline ml-3 text-5xl">SHOP</span>
          </div>

          <Link href="/pages/game"
            onMouseEnter={() => soundManager.playSound("hover")}
            onClick={() => soundManager.playSound("click")}
            className="mx-auto select-none p-3 bg-red-300 dark:bg-red-900 w-1/2 rounded-2xl cursor-pointer hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            EXIT
          </Link>

        </div>
        <div className="grid md:grid-cols-2 mt-10 md:mt-15 outline-1 outline-white/25 p-4 rounded-2xl shadow-md">
          <article className="grid grid-cols-2 w-full h-full">
            <div className="flex items-center">
              <span className="inline mx-auto mr-3">Exchange</span>
              <span className="inline mx-auto"><WikiPoint /></span>
            </div>

            <div className="flex items-center">
              <span className="inline mx-auto">for</span>
              <span className="mx-auto"><WongoPoint /></span>
              <span className="mx-auto">x10</span>
            </div>
          </article>

          <a
            onMouseEnter={() => soundManager.playSound("hover")}
            onClick={() => { soundManager.playSound("click"); purchaseWikiPoints(); }}
            className="mx-auto md:mr-0 mt-5 md:mt-0 md:ml-auto select-none p-3 bg-white dark:bg-black w-1/2 rounded-2xl cursor-pointer hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
            EXCHANGE
          </a>
        </div>

        <h1 className="text-xl text-black dark:text-white mt-10 md:mt-20 text-left">Wongo Whispers</h1>

        {
          !!allWongoWhispers && allWongoWhispers.filter(w => !gameState.unlockedWhispers.includes(w.id)).map(w => {
            const Icon = w.icon;
            return (
              <div key={w.id} className="grid grid-cols-1 md:grid-cols-8 gap-3 mt-5 outline-1 outline-white/25 p-5 md:p-2 rounded-2xl shadow-md mb-5">
                <Icon className="md:col-span-1 text-black dark:text-white md:my-auto mx-auto ml-0 md:ml-auto mt-5 text-4xl md:text-2xl" />

                <div className="md:col-span-3 my-auto">
                  <h1 className="text-black dark:text-white text-left text-2xl mb-2">{w.label}</h1>
                  <div className="text-left text-black/75 dark:text-white/75">{w.description}</div>
                </div>

                <article className="md:col-span-1 flex w-full h-full my-auto justify-end">
                  <span className="my-auto mr-3"><WikiPoint /></span>
                  <span className="my-5 md:my-auto mr-auto md:mr-0">x{w.purchaseCost}</span>
                </article>

                <a
                  onMouseEnter={() => soundManager.playSound("hover")}
                  onClick={() => { soundManager.playSound("click"); purchaseWongoWhisper(w) }}
                  className="md:col-span-3 my-auto select-none p-3 bg-white dark:bg-black rounded-2xl cursor-pointer hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12">
                  PURCHASE
                </a>

              </div>
            )
          })
        }
      </div>
    </section>
  )
}
