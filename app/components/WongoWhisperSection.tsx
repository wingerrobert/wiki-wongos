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
      {
        whispers && whispers.filter(w => { 
          !w.special && Object.values(context.whisperCounts).some(wc => wc > 0); 
        }).length > 0 &&
          <h1 className="text-black dark:text-white select-none">Wongo Whispers</h1>
      }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-2 lg:gap-3 mt-10 mb-5">
        {
          whispers && whispers.filter(w => {
            const isGiveUp = w.id === 'whisper_end_game';
            const allOthersZero = Object.entries(context.whisperCounts)
              .filter(([id]) => id !== 'whisper_end_game' && id !== "whisper_buy_photo" && id !== "whisper_show_extract")
              .every(([, count]) => count === 0);

            if (isGiveUp) {
              return allOthersZero;
            }

            return false;
          }).map(w => {
            return (
              <button key={w.id}
                onClick={() => { w.onActivate(w, context); soundManager.playSound('click'); }}
                className="fixed select-none cursor-pointer bottom-5 md:bottom-auto md:top-5 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg shadow-xl z-50 transition-opacity duration-300 animate-fade-in"
              >
                  End Game
              </button>
            )
          })
        }
        {
          whispers && whispers
            .filter(w => {
              return context.whisperCounts[w.id] > 0 && !w.special;
            })

            .map(w => {
              const Icon = w.icon;
              return (
                <div key={w.id} className="grid grid-cols-7 p-5 bg-white dark:bg-black/30 shadow-lg rounded-xl mb-3 md:mb-0">
                  <Icon className="text-black dark:text-white font-bold my-auto text-xl" />
                  <a
                    className={`${(w.id === 'whisper_buy_extract' && !context.hasExtract || w.id === 'whisper_buy_extract' && context.purchasedExtract || w.id === 'whisper_buy_picture' && !context.hasPhoto || w.id === 'whisper_buy_picture' && context.purchasedPhoto || context.whisperCounts[w.id] <= 0) ? "disabled bg-gray-800 cursor-not-allowed hover:bg-gray-800 text-gray-500" : "cursor-pointer hover:bg-cyan-800 dark:hover:bg-cyan-950 text-white"} col-span-3 rounded-sm p-2 bg-black block text-center w-full text-xs md:text-lg select-none`}

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
