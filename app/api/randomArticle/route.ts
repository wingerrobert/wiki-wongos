import { NextResponse } from "next/server";
import * as wikiservice from "../../services/wikiservice"

export async function GET() {
  try {
    const article = await wikiservice.getRandomArticle();

    if (!article) {
      console.error("Error fetching article");
      return NextResponse.json(null, { status: 500 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article", error);
    return NextResponse.json(null, { status: 500 });
  }
}
