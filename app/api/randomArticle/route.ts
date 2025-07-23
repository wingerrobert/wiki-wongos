import { NextResponse } from "next/server";
import * as wikiservice from "../../services/wikiservice";
import { initialGameState } from "@/app/global";
import { adminDb } from "@/app/firebaseAdmin"; // Ensure this uses firebase-admin

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");

  if (!playerId) {
    console.error("Missing playerID in get random article API request");
    return NextResponse.json(null, { status: 400 });
  }

  try {
    // Use Firebase Admin SDK to bypass Firestore rules
    const stateSnap = await adminDb.collection("gamestate").doc(playerId).get();

    const serverGameState = {
      ...initialGameState,
      ...stateSnap.data(),
      previousArticleIds: stateSnap.data()?.previousArticleIds ?? [],
    };

    // Pass hydrated state to the wiki service
    const article = await wikiservice.getRandomArticle(serverGameState.previousArticleIds);

    if (!article) {
      console.error("No article returned");
      return NextResponse.json(null, { status: 500 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
