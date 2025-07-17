'use client';

import { useEffect, useState } from "react";
import { FaMusic } from "react-icons/fa6";
import globalDefaults from "../global";

const ReactHowler = require("react-howler") as any;
const BG_MUSIC_PATH = "/audio/bg-music.wav";

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(globalDefaults.startingVolume);

  function handleVolumeChange(value: number) {
    setVolume(value);
  }

  return <article className="w-1/2 mt-2 md:p-5 z-10">
    <div>
      <FaMusic className="text-black dark:text-white text-xl inline mr-3" />
      <input type="range" className="inline my-auto" defaultValue={globalDefaults.startingVolume} onChange={e => handleVolumeChange(parseFloat(e.target.value))} max={1} min={0} step={0.1} />
    </div>    
    <ReactHowler
      src={BG_MUSIC_PATH}
      preload={true}
      playing={isPlaying}
      loop={true}
      volume={volume}
    />
  </article>
}
