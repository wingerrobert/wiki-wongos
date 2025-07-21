'use client';

import { allWongoWhispers, WongoWhisper, WongoWhisperContext } from "../helpers/WongoWhisperActions";
import soundManager from "../managers/soundManager";

type WongoWhisperSectionProps = {
  context: WongoWhisperContext;
}

const whispers = allWongoWhispers;


export default function WongoWhisperSection({ context }: WongoWhisperSectionProps) {
  return (
    <section className="mt-5">
      <h1 className="text-black dark:text-white select-none">Wongo Whispers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-2 lg:gap-3 mt-10 mb-5">
        {
          whispers && whispers
            .filter(w => {
              return (!!context.whisperCounts) ? Object.keys(context.whisperCounts).includes(w.id) : false;
            })
            .map(w => {
              const Icon = w.icon;
              return (
                <div key={w.id} className="grid grid-cols-7 p-5 bg-green-400/30 dark:bg-black/30 shadow-lg rounded-xl mb-3 md:mb-0">
                  <Icon className="text-black dark:text-white font-bold my-auto text-xl" />
                  <a
                    className={`${(w.id === 'whisper_buy_picture' && !context.hasPhoto || w.id === 'whisper_buy_picture' && context.purchasedPhoto || context.whisperCounts[w.id] <= 0) ? "disabled bg-gray-800 cursor-not-allowed hover:bg-gray-800 text-gray-500" : "cursor-pointer hover:bg-cyan-600 dark:hover:bg-cyan-950 hover:text-white"} col-span-3 rounded-sm p-2 bg-cyan-300 text-black block text-center w-full text-xs md:text-lg select-none`}

                    onMouseEnter={() => soundManager.playSound('hover')}
                    onClick={() => {
                      w.onActivate(w, context);
                      soundManager.playSound('click');
                    }}>{w.label}</a>
                  <span className="col-span-1 inline my-auto font-bold select-none pointer-events-none ml-5">x{context.whisperCounts[w.id]}</span>
                </div>
              )
            })
        }
      </div>
    </section>
  )
}
