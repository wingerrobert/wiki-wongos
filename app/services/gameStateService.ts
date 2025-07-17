import { doc, DocumentReference, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { GameState, gameState, globalDefaults } from "../global";
import { v4 as uuidv4 } from "uuid";
import { getAuth, signInAnonymously } from "firebase/auth";


function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function getPlayerDocRef(): DocumentReference {
  if (!gameState.playerId) {
    throw new Error("Player ID is undefined.");
  }

  return doc(db, "gamestate", gameState.playerId);
}

async function initializePlayerDocument() {
  if (!isBrowser()) { 
    return;
  }

  await ensureAuthenticated();

  const storedId = localStorage.getItem("playerId");

  if (storedId) {
    gameState.playerId = storedId;
    return;
  }

  gameState.playerId = uuidv4();
  localStorage.setItem("playerId", gameState.playerId);

  const stateRef = getPlayerDocRef();
  await setDoc(stateRef, gameState);

  console.log(`Stored state\n${JSON.stringify(gameState)}\n→ ${stateRef.path}`);
}

export async function initializeGameState() {
  if (!isBrowser()) { 
    return; 
  }

  await ensureAuthenticated();

  const stateSnap = await getStateFromPlayerId();

  if (stateSnap?.exists()) {
    const stored = stateSnap.data() as GameState;
    gameState.wikis = stored.wikis ?? globalDefaults.startingWikis;
    gameState.wongos = stored.wongos ?? globalDefaults.startingWongos;
    gameState.currentPlaceholder = stored.currentPlaceholder ?? "";
    gameState.levelsCompleted = stored.levelsCompleted ?? 0;
    gameState.currentArticleId = stored.currentArticleId ?? "";
  }
}

export async function saveGameStateToFirebase() {
  if (!isBrowser()) { 
    return; 
  }

  await ensureAuthenticated();

  const storedId = localStorage.getItem("playerId");
  if (!gameState.playerId && storedId) {
    gameState.playerId = storedId;
  }

  const stateRef = getPlayerDocRef();
  await setDoc(stateRef, gameState);
}

async function getStateFromPlayerId() {
  if (!isBrowser()) { 
    return null; 
  }

  await ensureAuthenticated();

  let playerId = localStorage.getItem("playerId");

  if (!playerId) {
    await initializePlayerDocument();
    playerId = localStorage.getItem("playerId");
  }

  if (!playerId) {
    throw new Error("Player ID is not set.");
  }

  gameState.playerId = playerId; // Ensure global state is synced
  const stateRef = getPlayerDocRef();
  return await getDoc(stateRef);
}

export default {
  initializeGameState,
  saveGameStateToFirebase,
};

async function ensureAuthenticated(): Promise<void>
{
  const auth = getAuth();

  if (auth.currentUser)
  {
    return;
  }

  await signInAnonymously(auth)
    .then(() => console.log("Signed in anonymously"))
    .catch((err) => console.error("Sign-in error:", err));
}
