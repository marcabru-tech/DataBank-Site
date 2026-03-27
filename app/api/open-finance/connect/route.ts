import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createConnectToken } from "@/lib/open-finance/client";
import logger from "@/lib/logger";

/**
 * POST /api/open-finance/connect
 * Inicia o fluxo de conexão de conta bancária via Open Finance.
 * Retorna um connect token para o widget do provedor.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const body = (await req.json()) as { provider?: string };
  const provider = (body.provider ?? process.env.OPEN_FINANCE_PROVIDER ?? "pluggy") as
    | "pluggy"
    | "belvo";

  if (!["pluggy", "belvo"].includes(provider)) {
    return NextResponse.json({ error: "Provedor inválido" }, { status: 400 });
  }

  const webhookUrl = `${process.env.NEXTAUTH_URL ?? ""}/api/open-finance/webhook`;

  const { connectToken, expiresAt } = await createConnectToken({ userId, webhookUrl });

  // Cria registro pendente de DataConnection
  const connection = await prisma.dataConnection.create({
    data: { userId, provider, externalId: "pending", status: "pending" },
  });

  logger.info({ userId, connectionId: connection.id, provider }, "Open Finance connect initiated");

  return NextResponse.json({ connectToken, expiresAt, connectionId: connection.id });
}
