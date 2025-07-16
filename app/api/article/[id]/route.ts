import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const ref = doc(db, 'articles', id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(snap.data(), { status: 200 });
  } catch (err) {
    console.error('Failed to fetch article:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
