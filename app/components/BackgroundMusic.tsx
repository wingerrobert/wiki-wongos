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

  return <article className="w-1/2 p-5">
    <FaMusic className="text-black dark:text-white text-4xl md:text-xl block md:inline my-auto mx-auto md:mx-0 mb-5 md:mb-0" />
    <input type="range" className="block md:inline my-auto mx-auto md:mr-0 md:ml-5" defaultValue={globalDefaults.startingVolume} onChange={e => handleVolumeChange(parseFloat(e.target.value))} max={1} min={0} step={0.1} />
    <ReactHowler
      src={BG_MUSIC_PATH}
      preload={true}
      html5={true}
      playing={isPlaying}
      loop={true}
      volume={volume}
    />
  </article>
}
