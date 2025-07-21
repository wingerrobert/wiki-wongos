'use client';

import FadeTransition from "@/app/components/FadeTransition";
import WikiPoint from "@/app/components/WikiPoint";
import WikiPointsBar from "@/app/components/WikiPointsBar";
import WongoPoint from "@/app/components/WongoPoint";
import WongoPointsBar from "@/app/components/WongoPointsBar";
import { gameState } from "@/app/global";
import { allWongoWhispers, WongoWhisper } from "@/app/helpers/WongoWhisperActions";
import soundManager from "@/app/managers/soundManager";
import gameStateService, { saveGameStateToFirebase } from "@/app/services/gameStateService";
import { WikiArticle } from "@/app/services/wikiservice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Shop() {
  const [wikiPoints, setWikiPoints] = useState(gameState.wikis);
  const [wongoPoints, setWongoPoints] = useState(gameState.wongos);
  const [successfulPurchase, setSuccessfulPurchase] = useState<boolean | null>(null);

  const [whisperCounts, setWhisperCounts] = useState<Record<string, number>>(gameState.whispers);

  const [isTransitioning, setIsTransitioning] = useState(true);

  const unsuccessfulWarningDisplayTime = 5000;

  const router = useRouter();

  useEffect(() => {
    (async function initGame() {
      setIsTransitioning(false);
      
      const init = async () => {
        await gameStateService.updateGameStateFromStorage();
      };

      await init();

      if (!gameState.isExistingGame || !gameState.currentArticleId) {
        gameState.isExistingGame = true;
        return;
      }

      const response = await fetch('/api/randomArticle');
      const nextArticle: WikiArticle = await response.json() as WikiArticle;

      gameState.currentArticleId = nextArticle.pageid;
      gameState.currentPlaceholder = "";

      setWhisperCounts(gameState.whispers);
      setWikiPoints(gameState.wikis);
      setWongoPoints(gameState.wongos);
    })();
  }, []);

  async function purchaseWongoWhisper(whisper: WongoWhisper) {
    if (!whisper || !whisper.purchaseCost || !whisper.purchaseQuantity) {
      displayPurchaseWarningMessage();
      return;
    }

    const newWikiPoints: number = wikiPoints - whisper.purchaseCost;

    if (newWikiPoints < 0) {
      soundManager.playSound('lose');
      displayPurchaseWarningMessage();
      return;
    }

    setWikiPoints(newWikiPoints);

    if (!Object.keys(gameState.whispers).includes(whisper.id)) {
      gameState.whispers = { ...gameState.whispers, [whisper.id]: whisper.purchaseQuantity };
    } else {
      gameState.whispers[whisper.id] = gameState.whispers[whisper.id] + whisper.purchaseQuantity;
    }

    setWhisperCounts(gameState.whispers);

    soundManager.playSound('win');

    gameState.wikis = newWikiPoints;

    setSuccessfulPurchase(true);

    await saveGameStateToFirebase();
  }

  async function purchaseWikiPoints() {
    const newWikiPoints = wikiPoints - 1;
    const newWongoPoints = wongoPoints + 10;

    if (newWikiPoints < 0) {
      soundManager.playSound('lose');
      displayPurchaseWarningMessage();
      return;
    }

    setWikiPoints(newWikiPoints);
    setWongoPoints(newWongoPoints);

    gameState.wongos = newWongoPoints;
    gameState.wikis = newWikiPoints;

    setSuccessfulPurchase(true);

    soundManager.playSound('win');

    await saveGameStateToFirebase();
  }

  function displayPurchaseWarningMessage() {
    if (successfulPurchase != null) {
      return;
    }

    setSuccessfulPurchase(false);
    setTimeout(() => { setSuccessfulPurchase(null); }, unsuccessfulWarningDisplayTime);
  }

  function onExitClick() {
    soundManager.playSound("click");

    gameState.currentArticleId = "";
    gameState.currentPlaceholder = "";

    setIsTransitioning(true);

    setTimeout(() => { router.push("/pages/game") }, 500);
  }

  return (
    <section className="grid grid-cols-1 justify-center p-5 md:p-0 md:w-1/2 mx-auto mt-10">
      <FadeTransition isTransitioning={!isTransitioning} />
      <div className="flex flex-col">
        <div className="flex"><WikiPointsBar points={wikiPoints} /></div>
        <div className="flex"><WongoPointsBar points={wongoPoints} /></div>
      </div>
      <div className="text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 justify-center md:justify-around">
          <div className="mx-auto mb-5">
            <span className="font-libertine inline text-5xl">WW</span><span className="inline ml-3 text-5xl">SHOP</span>
          </div>

          <a
            onMouseEnter={() => soundManager.playSound("hover")}
            onClick={onExitClick}
            className="h-12 mx-auto select-none text-white p-3 bg-red-500 w-1/2 rounded-2xl cursor-pointer hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            EXIT
          </a>

        </div>

        <div className="relative w-full">
          <div className={`p-2 rounded-xl text-white w-full bg-red-500 text-2xl text-bold absolute float ${successfulPurchase === false ? "block" : "hidden"}`}>You can't afford that!</div>
        </div>
        
        <h1 className="text-xl text-black dark:text-white mt-10 md:mt-20 text-left">WIKI-2-WONGO</h1>
        <h5 className="font-extralight text-xl text-black/60 dark:text-white/60 text-left">Trade Currency for Health!</h5>
        
        <div className="bg-white/25 dark:bg-black/25 grid md:grid-cols-2 mt-10 md:mt-15 outline-1 outline-white/25 p-4 rounded-2xl shadow-md">
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
            className="mx-auto text-white md:mr-0 mt-5 md:mt-0 md:ml-auto select-none p-3 bg-black w-1/2 rounded-2xl cursor-pointer hover:bg-white hover:text-black">
            EXCHANGE
          </a>
        </div>

        <h1 className="text-xl text-black dark:text-white mt-10 md:mt-20 text-left">Wongo Whispers</h1>
        <h5 className="font-extralight text-xl text-black/60 dark:text-white/60 text-left">Single-Use Hints!</h5>

        {
          !!allWongoWhispers && allWongoWhispers.filter(w=>!w.special).map(w => {
            const Icon = w.icon;
            return (
              <div key={w.id} className="dark:bg-black/25 bg-white/25 grid grid-cols-1 md:grid-cols-8 gap-3 mt-5 outline-1 outline-white/25 p-5 md:p-2 rounded-2xl shadow-md mb-5">
                <Icon className="md:col-span-1 text-black dark:text-white md:my-auto mx-auto ml-0 md:ml-auto mt-5 text-4xl md:text-2xl" />

                <div className="md:col-span-3 my-auto">
                  <h1 className="text-black dark:text-white text-2xl mb-2 block md:inline">{w.label}</h1>
                  <h1 className="text-green-500 dark:text-yellow-500 text-2xl mb-2 block md:inline md:ml-5">{`(Pack of ${w.purchaseQuantity})`}</h1>
                  <div className="text-left text-black/75 dark:text-white/75">{w.description}</div>
                </div>

                <h1 className="md:col-span-1 my-auto">Owned: x{whisperCounts[w.id] ?? 0}</h1>

                <article className="md:col-span-1 flex w-full h-full my-auto justify-end">
                  <span className="my-auto mr-3"><WikiPoint /></span>
                  <span className="my-5 md:my-auto mr-auto md:mr-0">x{w.purchaseCost}</span>
                </article>

                <a
                  onMouseEnter={() => soundManager.playSound("hover")}
                  onClick={() => { soundManager.playSound("click"); purchaseWongoWhisper(w) }}
                  className="md:col-span-2 text-white my-auto select-none p-3 bg-black rounded-2xl cursor-pointer hover:bg-white hover:text-black h-12">
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
