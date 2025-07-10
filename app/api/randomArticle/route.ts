import { NextResponse } from "next/server";
import * as wikiservice from "../../services/wikiservice"

export async function GET() {
  try {
    const title = await wikiservice.getRandomArticleTitle();

    if (!title) {
      console.error("Error fetching article title");
      return NextResponse.json({ title: null }, { status: 500 });
    }

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Error fetching article title:", error);
    return NextResponse.json({ title: null }, { status: 500 });
  }
}
