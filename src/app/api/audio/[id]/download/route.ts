import { NextRequest, NextResponse } from "next/server";
import { getGenerationById } from "@/lib/history-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = getGenerationById(id);

    if (!item) {
      return NextResponse.json({ error: "Audio record not found" }, { status: 404 });
    }

    // Convert base64 data URL to Buffer
    const base64Data = item.audioUrl.split(",")[1];
    const audioBuffer = Buffer.from(base64Data, "base64");
    const filename = `voxcraft-${item.voice.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.wav`;

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
