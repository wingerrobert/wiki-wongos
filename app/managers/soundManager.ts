import { Howl } from 'howler';

class SoundManager {
  private sounds: Record<string, Howl>;

  constructor() {
    this.sounds = {
      click: new Howl({ src: ['/audio/clickSound.wav'], volume: 1 }),
      hover: new Howl({ src: ['/audio/hoverSound.wav'], volume: 1 }),
      win: new Howl({ src: ['/audio/winSound.wav'], volume: 1 }),
      lose: new Howl({ src: ['/audio/loseSound.wav'], volume: 1 }),
    };
  }

  playSound(name: string) {
    const sound = this.sounds[name];
    if (sound) {
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

const soundManager = new SoundManager();

export default soundManager;
