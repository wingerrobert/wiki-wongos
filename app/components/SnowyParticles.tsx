'use client';

import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";


export default function SnowyParticles() {
  const theme = useTheme(); 
  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        canvas: {
          pointerEvents: "auto"
        },
        fullScreen: { enable: true, zIndex: -1 },
        particles: {
          number: { value: 120, density: { enable: true, area: 800 } },
          color: { value: theme.theme === "dark" ? "#fff" : "#b3ddec" },
          shape: { type: "circle" },
          opacity: { value: theme.theme === "dark" ? 0.2 : 0.8, random: true },
          size: { value: 2, random: true },
          move: {
            enable: true,
            speed: 1,
            direction: "bottom",
            outMode: "out"
          }
        },
        interactivity: {
          detectsOn: "window",
          events: {
            onHover: { enable: true, mode: "repulse" },
            resize: true
          },
          modes: {
            repulse: { distance: 100, duration: 1 }
          }
        }
      }}
    />
  );
}
