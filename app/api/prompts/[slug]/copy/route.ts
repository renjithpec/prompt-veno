import { NextResponse } from "next/server";
import { trackPromptEvent } from "@/lib/data";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Validate slug: only lowercase letters, numbers, and hyphens, max 200 chars
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,198}[a-z0-9]$/;

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // Validate slug format
    if (!slug || !SLUG_REGEX.test(slug)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // Rate limit: max 30 copy requests per IP per 60 seconds
    const ip = getClientIp(request.headers);
    const { allowed } = rateLimit(ip, 30, 60_000, "copy");
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    await trackPromptEvent(slug, "copy");
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Log full error server-side, return generic message to client
    console.error("[copy-route]", error);
    return NextResponse.json(
      { error: "Request failed" },
      { status: 500 }
    );
  }
}
