import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"
import { GameState, gameState, globalDefaults } from "../global"
import { v4 as uuidv4 } from 'uuid';
import { getAuth, signInAnonymously } from "firebase/auth";

async function initializePlayerDocument()
{
  if (localStorage.getItem("playerId"))
  {
    return;
  }

  if (!gameState.playerId)
  {
    gameState.playerId = uuidv4();
  }

  localStorage.setItem("playerId", gameState.playerId);

  const stateRef = doc(db, "gamestate", gameState.playerId);

  await setDoc(stateRef, gameState);

  console.log(`stored state\n${JSON.stringify(gameState)}\nin ${stateRef.path}`);
}

export async function initializeGameState()
{
  const auth = getAuth();

  signInAnonymously(auth)
    .then(() => {
      console.log("Signed in succeffully");
    })
    .catch(error => {
      console.error("Sign in error", error);
    });
  
  if (typeof window === "undefined")
  {
    throw new Error("GameState cannot be created during SSR.");
  }

  const stateSnap = await getStateFromPlayerId();

  if (stateSnap && stateSnap.exists())
  {
    const storedState = stateSnap.data() as GameState;

    gameState.wikis = storedState.wikis ?? globalDefaults.startingWikis;
    gameState.wongos = storedState.wongos ?? globalDefaults.startingWongos;
    gameState.currentPlaceholder = storedState.currentPlaceholder ?? "";
    gameState.levelsCompleted = storedState.levelsCompleted ?? 0;
    gameState.currentArticleId = storedState.currentArticleId ?? "";
  }
}

export async function saveGameStateToFirebase()
{
    const stateRef = doc(db, "gamestate", gameState.playerId);

    await setDoc(stateRef, gameState);
}

async function getStateFromPlayerId()
{
  let playerId = localStorage.getItem("playerId");

  if (!playerId)
  {
    await initializePlayerDocument();  
    playerId = localStorage.getItem("playerId");
  }
  
  if (!playerId)
  {
    throw new Error("Player ID is not set.");
  }

  const stateRef = doc(db, "gamestate", playerId);
  return await getDoc(stateRef);
}

export default {
  initializeGameState,
  saveGameStateToFirebase
};
