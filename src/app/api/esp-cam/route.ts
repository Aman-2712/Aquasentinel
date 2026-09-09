import { NextRequest, NextResponse } from 'next/server';

// In-memory frame storage for real-time ESP32-CAM uploads
const espCamFrames: Record<string, { image: string; timestamp: number; waterLevel?: number }> = {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nodeId = searchParams.get('nodeId') || 'all';

  if (nodeId === 'all') {
    return NextResponse.json({
      success: true,
      nodes: espCamFrames,
      timestamp: Date.now(),
    });
  }

  const frame = espCamFrames[nodeId];
  if (!frame) {
    return NextResponse.json({
      success: false,
      message: 'No active frame received yet for node: ' + nodeId,
      timestamp: Date.now(),
    });
  }

  return NextResponse.json({
    success: true,
    nodeId,
    frame: frame.image,
    timestamp: frame.timestamp,
    waterLevel: frame.waterLevel,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nodeId, image, waterLevel } = body;

    if (!nodeId || !image) {
      return NextResponse.json(
        { success: false, error: 'Missing nodeId or image base64 data' },
        { status: 400 }
      );
    }

    espCamFrames[nodeId] = {
      image,
      timestamp: Date.now(),
      waterLevel: typeof waterLevel === 'number' ? waterLevel : undefined,
    };

    return NextResponse.json({
      success: true,
      message: 'ESP-CAM frame received and updated for ' + nodeId,
      nodeId,
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to parse frame';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
