import { adminDb } from '@/app/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const snap = await adminDb.doc(`articles/${id}`).get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(snap.data(), { status: 200 });
  } catch (err) {
    console.error('Failed to fetch article:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
