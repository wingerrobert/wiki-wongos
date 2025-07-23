import { initializeWikiService } from "@/app/services/wikiservice";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await initializeWikiService();
    return NextResponse.json({ status: 200 });
  } catch (e) {
    console.error("Initialization failed", e);
    return NextResponse.json({ status: 500, error: "Initialization Failed" });
  }
}
