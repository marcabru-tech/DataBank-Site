import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/** GET /api/consent — lista consentimentos do usuário autenticado */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const consents = await prisma.consent.findMany({
    where: { userId, ...(status ? { status } : {}) },
    orderBy: { grantedAt: "desc" },
    include: { logs: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return NextResponse.json({ consents });
}

/** POST /api/consent — registra novo consentimento granular */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const body = (await req.json()) as {
    dataCategory: string;
    purpose: string;
    recipientId: string;
    expiresAt?: string;
  };

  const { dataCategory, purpose, recipientId, expiresAt } = body;

  if (!dataCategory || !purpose || !recipientId) {
    return NextResponse.json(
      { error: "dataCategory, purpose e recipientId são obrigatórios" },
      { status: 400 }
    );
  }

  const VALID_CATEGORIES = ["financial", "location", "behavioral", "identity"];
  if (!VALID_CATEGORIES.includes(dataCategory)) {
    return NextResponse.json(
      { error: `dataCategory inválido. Valores aceitos: ${VALID_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  const consent = await prisma.consent.create({
    data: {
      userId,
      dataCategory,
      purpose,
      recipientId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      logs: {
        create: {
          action: "granted",
          actorIp: ip,
          metadata: JSON.stringify({ dataCategory, purpose, recipientId }),
        },
      },
    },
  });

  logger.info({ consentId: consent.id, userId, dataCategory, purpose }, "Consent granted");

  return NextResponse.json({ consent }, { status: 201 });
}
