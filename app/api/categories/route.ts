import { NextResponse } from 'next/server'
import { Category, getCategories } from '../../services/wikiservice';

export async function GET(request: Request)
{
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  console.log(title);
  if (!title)
  {
    return NextResponse.json({ error: 'Title is required' , status: 400 });
  }

  const categories : Category[] = await getCategories(title);

  return NextResponse.json({ categories });
}
