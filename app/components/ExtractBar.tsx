'use client';

import { useEffect, useState } from "react";
import PictureCard from "./PictureCard";
import soundManager from "../managers/soundManager";
import ExtractCard from "./ExtractCard";

export default function ExtractBar({ articleTitle, extractText, purchased }: { articleTitle: string, extractText: string, purchased: boolean }) {

  const [showExtract, setShowExtract] = useState(false);
  
  useEffect(() => {
    setShowExtract(purchased);
  }, [purchased]);

  return (
    <section className="flex justify-center">
      <button
        onClick={() => { setShowExtract(!showExtract); soundManager.playSound('click'); }}
        onMouseEnter={() => { soundManager.playSound('hover'); }}
        className={`${purchased ? "block" : "hidden" } fixed top-20 right-4 z-50 bg-cyan-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-cyan-600 transition`}
      >
        {showExtract ? "Hide Extract" : "Show Extract"}
      </button>

      <div
        className={`max-h-1/2 fixed rounded-3xl bottom-0 justify-center mx-auto md:w-1/2 lg:w-1/3 bg-gradient-to-b from-gray-800 via-black to-gray-800 text-white p-4 shadow-lg transition-transform duration-500 ${showExtract ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <ExtractCard articleTitle={articleTitle} extractText={extractText}  />
      </div>
    </section>
  )
}
