import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/consent/export
 * Portabilidade de dados — Art. 18, V da LGPD.
 * Retorna todos os consentimentos do usuário em formato JSON.
 */
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const [user, consents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    }),
    prisma.consent.findMany({
      where: { userId },
      include: { logs: { orderBy: { createdAt: "asc" } } },
      orderBy: { grantedAt: "asc" },
    }),
  ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    subject: "Portabilidade de Dados — Art. 18, V LGPD",
    user,
    consents,
  };

  logger.info({ userId, totalConsents: consents.length }, "Data portability export generated");

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="databank-export-${userId}.json"`,
    },
  });
}
