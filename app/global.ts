export type GameState = {
  playerId: string;
  currentArticleId: string;
  currentPlaceholder: string;
  wikis: number;
  wongos: number;
  forceNewGame: boolean;
  levelsCompleted: number | null;
  whispers: Record<string, number>;
  isExistingGame: boolean;
  previousArticleIds: string[];
  justLeftShop: boolean;
  volume: number;
}

const defaults = {
  maxLoopIterations: 2000,
  delayAfterAnswer: 2000,
  delayAfterSkip: 2500,
  correctnessThreshold: 0.999,
  articleDaysToGrab: 10,
  firebaseArticleStorageCap: 5000,
  minimumArticles: 20,
  startingWongos: 10,
  startingWikis: 0,
  wikiPointsPerArticle: 2,
  wongoPointsPerArticle: 3,
  startingVolume: 0,
  transitionDuration: 500,
  articleLimit: 500,
  randomWhispersAvailableInShop: 2,
  useLevenshteinDistance: false,
  wikiForWongoExchangeRate: 3,
  levelsBeforeStore: 5,
  startingWongoWhispers: {
    "whisper_reveal_letter": 50,
    "whisper_end_game": 1
  }
};

export const globalDefaults = { ...defaults };

export const initialGameState: GameState = {
  volume: 0,
  playerId: "",
  justLeftShop: false,
  previousArticleIds: [],
  forceNewGame: false,
  wongos: globalDefaults.startingWongos,
  wikis: globalDefaults.startingWikis,
  levelsCompleted: null,
  currentPlaceholder: "",
  currentArticleId: "",
  whispers: globalDefaults.startingWongoWhispers,
  isExistingGame: false
};

export let gameState: GameState = {...initialGameState}; 

export function setGameState(newState: GameState)
{
  gameState = newState;
}

export const cheats = {
  unlockAllWhispers: false,
  freeWhispers: true
}

export default globalDefaults;
