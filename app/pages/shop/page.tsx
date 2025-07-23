'use client';

import FadeTransition from "@/app/components/FadeTransition";
import WikiPoint from "@/app/components/WikiPoint";
import WikiPointsBar from "@/app/components/WikiPointsBar";
import WongoPoint from "@/app/components/WongoPoint";
import WongoPointsBar from "@/app/components/WongoPointsBar";
import WongoWhisperShopCard from "@/app/components/WongoWhisperShopCard";
import globalDefaults, { gameState } from "@/app/global";
import { allWongoWhispers, WongoWhisper, WongoWhisperContext } from "@/app/helpers/WongoWhisperActions";
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

  const [randomWhispers, setRandomWhispers] = useState<WongoWhisper[]>([]);


  const unsuccessfulWarningDisplayTime = 5000;

  const router = useRouter();

  let timeout: ReturnType<typeof setTimeout>;

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

      setRandomWhispers(getRandomWhispers());

      const response = await fetch(`/api/randomArticle?playerId=${gameState.playerId}`);
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

  function getRandomWhispers() {
    const shuffled = [...allWongoWhispers].filter(w => !w.alwaysAvailableInShop && !w.hideInShop).sort(() => Math.random() - 0.5);
    const defaultWhispers = allWongoWhispers.filter(w => w.alwaysAvailableInShop);
    const randomWhispers = shuffled.slice(0, globalDefaults.randomWhispersAvailableInShop);
    return [...defaultWhispers, ...randomWhispers];
  }

  async function purchaseWikiPoints() {
    const newWikiPoints = wikiPoints - 1;
    const newWongoPoints = wongoPoints + globalDefaults.wikiForWongoExchangeRate;

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
    if (timeout) {
      clearTimeout(timeout);
    }

    if (successfulPurchase != null) {
      return;
    }

    setSuccessfulPurchase(false);
    timeout = setTimeout(() => { setSuccessfulPurchase(null); }, unsuccessfulWarningDisplayTime);
  }

  function onExitClick() {
    soundManager.playSound("click");

    gameState.justLeftShop = true;

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

        <h1 className="text-xl text-black dark:text-white mt-10 md:mt-20 text-left">Wongo Whispers</h1>
        <h5 className="font-extralight text-xl text-black/60 dark:text-white/60 text-left">Hints Hints Hints!</h5>

        {
          randomWhispers.filter(w => !w.hideInShop).sort((a, b) => a.purchaseCost - b.purchaseCost).map(w => {
            return <WongoWhisperShopCard key={w.id} whisper={w} whisperCounts={whisperCounts} purchaseWikiPointsAction={purchaseWikiPoints} purchaseWongoWhisperAction={purchaseWongoWhisper} wikiPoints={wikiPoints} />
          })
        }
      </div>
    </section>
  )
}
