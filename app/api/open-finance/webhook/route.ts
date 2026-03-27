import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyWebhookSignature,
  handleWebhookEvent,
  WebhookEvent,
} from "@/lib/open-finance/webhooks";
import logger from "@/lib/logger";

/**
 * POST /api/open-finance/webhook
 * Recebe e processa eventos assíncronos do provedor de Open Finance.
 * Verifica a assinatura HMAC antes de qualquer processamento.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.OPEN_FINANCE_WEBHOOK_SECRET;

  const rawBody = await req.text();
  const signature =
    req.headers.get("x-pluggy-signature") ?? req.headers.get("x-belvo-signature") ?? "";

  if (secret) {
    const isValid = verifyWebhookSignature(rawBody, signature, secret);
    if (!isValid) {
      logger.warn("Webhook: assinatura inválida — request rejeitado");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    logger.warn(
      "OPEN_FINANCE_WEBHOOK_SECRET não configurado — verificação de assinatura desabilitada"
    );
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Atualiza o DataConnection correspondente se o item foi criado/atualizado
  if (event.itemId && (event.type === "item/created" || event.type === "item/updated")) {
    await prisma.dataConnection.updateMany({
      where: { externalId: "pending", status: "pending" },
      data: { externalId: event.itemId, status: "connected", lastSyncedAt: new Date() },
    });
  }

  await handleWebhookEvent(event);

  return NextResponse.json({ received: true });
}
