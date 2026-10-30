import { NextRequest, NextResponse } from "next/server";
import { globalHistoryStore, removeGeneration } from "@/lib/history-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20");

  return NextResponse.json({
    success: true,
    data: {
      items: globalHistoryStore.slice(0, limit),
      total: globalHistoryStore.length,
    },
  });
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Generation ID is required" }, { status: 400 });
    }

    const removed = removeGeneration(id);
    return NextResponse.json({ success: removed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
