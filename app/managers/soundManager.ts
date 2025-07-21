import { Howl } from 'howler';
import { gameState } from '../global';

class SoundManager {
  private sounds: Record<string, Howl>;

  constructor() {
    this.sounds = {
      click: new Howl({ src: ['/audio/clickSound.wav'] }),
      hover: new Howl({ src: ['/audio/hoverSound.wav'] }),
      win:   new Howl({ src: ['/audio/winSound.wav'] }),
      lose:  new Howl({ src: ['/audio/loseSound.wav'] }),
    };
  }

  playSound(name: string) {
    const sound = this.sounds[name];
    if (sound) {
      sound.volume(gameState.volume);
      sound.play();
    } else {
      console.warn(`Sound "${name}" not found.`);
    }
  }

  stopSound(name: string) {
    const sound = this.sounds[name];
    if (sound) {
      sound.stop();
    }
  }

  setVolume(name: string, volume: number) {
    const sound = this.sounds[name];
    if (sound) {
      sound.volume(volume);
    }
  }
}

const soundManager = new SoundManager(gameState.volume);

export default soundManager;
