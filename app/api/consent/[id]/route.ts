import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/** PATCH /api/consent/[id] — revoga um consentimento ativo */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const consent = await prisma.consent.findUnique({ where: { id } });

  if (!consent) {
    return NextResponse.json({ error: "Consentimento não encontrado" }, { status: 404 });
  }

  if (consent.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (consent.status !== "active") {
    return NextResponse.json({ error: "Consentimento já está inativo" }, { status: 409 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const now = new Date();

  const [updated] = await prisma.$transaction([
    prisma.consent.update({
      where: { id },
      data: { status: "revoked", revokedAt: now },
    }),
    prisma.consentLog.create({
      data: {
        consentId: id,
        action: "revoked",
        actorIp: ip,
        metadata: { revokedAt: now.toISOString() },
      },
    }),
  ]);

  logger.info({ consentId: id, userId }, "Consent revoked");

  return NextResponse.json({ consent: updated });
}
