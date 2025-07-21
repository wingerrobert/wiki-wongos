import { adminDb } from "@/app/firebaseAdmin";
import { updateArticleDifficulty } from "@/app/services/wikiservice";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const body = await request.json();
  const { articleGuesses, whispersUsed } = body;

  if (typeof articleGuesses !== 'number' || typeof whispersUsed !== 'number') {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
  }

  try {
    const snap = await adminDb.doc(`articles/${id}`).get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    await updateArticleDifficulty(id, articleGuesses, whispersUsed);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Failed to update difficulty:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
