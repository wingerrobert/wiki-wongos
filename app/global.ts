export type GameState = {
  playerId: string;
  currentArticleId: string;
  currentPlaceholder: string;
  wikis: number;
  wongos: number;
  levelsCompleted: number;
  unlockedWhispers: string[];
}

export const globalDefaults = {
  maxLoopIterations: 2000,
  delayAfterAnswer: 1000,
  delayAfterSkip: 2000,
  correctnessThreshold: 0.999,
  articleDaysToGrab: 10,
  firebaseArticleStorageCap: 5000,
  minimumArticles: 20,
  startingWongos: 100,
  startingWikis: 0,
  startingVolume: 0,
  transitionDuration: 250,
  useLevenshteinDistance: false,
  maxPhotoHintsPerArticle: 5
};

export const gameState: GameState = {
  playerId: "",
  wongos: globalDefaults.startingWongos,
  wikis: globalDefaults.startingWikis,
  levelsCompleted: 0,
  currentPlaceholder: "",
  currentArticleId: "",
  unlockedWhispers: ["whisper_reveal_letter"]
};

export const cheats = {
  unlockAllWhispers: true
}

export default globalDefaults;
