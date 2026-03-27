import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, use_case } = body as {
    name: string;
    email: string;
    use_case?: string;
  };

  if (!name || !email) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 });
  }

  if (process.env.PERSIST_LEADS === "true") {
    const { prisma } = await import("@/lib/db");
    const lead = await prisma.lead.create({
      data: { name, email, use_case: use_case ?? "" },
    });
    logger.info({ leadId: lead.id, email }, "Lead persisted");
    return NextResponse.json({ ok: true, id: lead.id });
  }

  logger.info({ email }, "Lead received (mock mode)");
  return NextResponse.json({ ok: true });
}
