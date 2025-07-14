import { NextResponse } from "next/server";
import { getAppList } from "@/lib/helpers";



export async function GET() {
  try {
    const apps = await getAppList();
    return NextResponse.json({ apps });
  } catch (error) {
    console.error("Error fetching Steam apps:", error);

    return NextResponse.json(
      { error: "Failed to fetch Steam apps" },
      { status: 500 }
    );
  }
} 