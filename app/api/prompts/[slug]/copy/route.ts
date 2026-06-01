import { NextResponse } from "next/server";
import { trackPromptEvent } from "@/lib/data";

export async function POST(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await trackPromptEvent(slug, "copy");
  return NextResponse.json({ ok: true });
}
