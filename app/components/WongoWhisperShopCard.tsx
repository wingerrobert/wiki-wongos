import { useState } from "react";
import { WongoWhisper } from "../helpers/WongoWhisperActions";
import soundManager from "../managers/soundManager";
import WikiPoint from "./WikiPoint";

type WongoWhisperShopCardProps = {
  whisper: WongoWhisper;
  whisperCounts: Record<string, number>;
  purchaseWongoWhisperAction: (whisper: WongoWhisper) => void;
  purchaseWikiPointsAction: ()=>void;
  wikiPoints: number;
}

export default function WongoWhisperShopCard({ wikiPoints, whisper, whisperCounts, purchaseWongoWhisperAction, purchaseWikiPointsAction }: WongoWhisperShopCardProps) {
  const [flash, setFlash] = useState(false);
  const [flashColor, setFlashColor] = useState("bg-yellow-500/25");

  let timeout : ReturnType<typeof setTimeout>;

  function flashBackground() {

    const canAfford = wikiPoints - whisper.purchaseCost >= 0;

    if (timeout) {
      clearTimeout(timeout);
    }
    
    setFlashColor(canAfford ? "bg-yellow-500/25" : "bg-red-500/50");
    soundManager.playSound(canAfford ? "win" : "lose");
    
    setFlash(true);
    
    timeout = setTimeout(() => setFlash(false), 500);
    
    purchaseWongoWhisperAction(whisper);

    if (whisper.id === "whisper_wiki_for_wongo")
    {
      purchaseWikiPointsAction();
    }
  }

  const Icon = whisper.icon;
  return (
    <div className={`${flash ? flashColor : "dark:bg-black/25 bg-white/25" } grid grid-cols-1 md:grid-cols-8 gap-3 mt-5 outline-1 outline-white/25 p-5 md:p-2 rounded-2xl shadow-md mb-5`}>
      <Icon className="md:col-span-1 text-black dark:text-white md:my-auto mx-auto ml-0 md:ml-auto mt-5 text-4xl md:text-2xl" />

      <div className="md:col-span-3 my-auto">
        <h1 className="text-black dark:text-white text-2xl mb-2 block md:inline">{whisper.label}</h1>
        <h1 className="text-green-500 dark:text-yellow-500 text-2xl mb-2 block md:inline md:ml-5">{`(Pack of ${whisper.purchaseQuantity})`}</h1>
        <div className="text-left text-black/75 dark:text-white/75">{whisper.description}</div>
      </div>

      <h1 className="md:col-span-1 my-auto">Owned: x{whisperCounts[whisper.id] ?? 0}</h1>

      <article className="md:col-span-1 flex w-full h-full my-auto justify-end">
        <span className="my-auto mr-3"><WikiPoint /></span>
        <span className="my-5 md:my-auto mr-auto md:mr-0">x{whisper.purchaseCost}</span>
      </article>

      <a
        onMouseEnter={() => soundManager.playSound("hover")}
        onClick={() => { flashBackground(); }}
        className="md:col-span-2 text-white my-auto select-none p-3 bg-black rounded-2xl cursor-pointer hover:bg-white hover:text-black h-12">
        PURCHASE
      </a>

    </div>
  )
}

