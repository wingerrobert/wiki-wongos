'use client';

import { useEffect, useState } from "react";
import PictureCard from "./PictureCard";
import soundManager from "../managers/soundManager";

export default function PictureBar({ src, purchased }: { src: string | undefined, purchased: boolean }) {

  const [showPhotos, setShowPhotos] = useState(false);
  
  useEffect(() => {
    setShowPhotos(purchased);
  }, [purchased]);

  return (
    <section className="flex justify-center">
      <button
        onClick={() => { setShowPhotos(!showPhotos); soundManager.playSound('click'); }}
        onMouseEnter={() => { soundManager.playSound('hover'); }}
        className={`${purchased ? "block" : "hidden" } fixed top-4 right-4 z-50 bg-cyan-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-cyan-600 transition`}
      >
        {showPhotos ? "Hide Photo" : "Show Photo"}
      </button>

      <div
        className={`max-h-1/2 fixed rounded-3xl bottom-0 justify-center mx-auto md:w-1/2 lg:w-1/3 bg-gradient-to-b from-gray-800 via-black to-gray-800 text-white p-4 shadow-lg transition-transform duration-500 ${showPhotos ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <PictureCard src={src} />
      </div>
    </section>
  )
}
