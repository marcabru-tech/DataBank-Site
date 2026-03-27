/**
 * Webhook handler para eventos do Open Finance.
 *
 * Provedores como Pluggy e Belvo enviam eventos assíncronos via webhook
 * quando dados de uma conta são atualizados, erros ocorrem, etc.
 *
 * Cada evento deve ser verificado criptograficamente antes de ser processado.
 */

import { createHmac, timingSafeEqual } from "crypto";
import logger from "@/lib/logger";

export type WebhookEventType =
  | "item/created"
  | "item/updated"
  | "item/error"
  | "item/login_error"
  | "transactions/updated"
  | "accounts/updated";

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  itemId: string;
  occurredAt: string;
  data?: Record<string, unknown>;
}

/**
 * Verifica a assinatura HMAC do payload recebido do provedor.
 * Deve ser chamado ANTES de processar qualquer evento.
 *
 * @param payload  - corpo raw do request (Buffer ou string)
 * @param signature - header X-Pluggy-Signature ou X-Belvo-Signature
 * @param secret    - OPEN_FINANCE_WEBHOOK_SECRET do env
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret).update(payload, "utf8").digest("hex");
  const sigBuffer = Buffer.from(signature.replace(/^sha256=/, ""));
  const expBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expBuffer.length) return false;
  return timingSafeEqual(sigBuffer, expBuffer);
}

/**
 * Processa um evento de webhook verificado.
 */
export async function handleWebhookEvent(event: WebhookEvent): Promise<void> {
  logger.info(
    { webhookEventId: event.id, type: event.type, itemId: event.itemId },
    "Webhook event received"
  );

  switch (event.type) {
    case "item/created":
    case "item/updated":
    case "accounts/updated":
    case "transactions/updated":
      // TODO: acionar pipeline de atualização de dados do usuário
      logger.info({ itemId: event.itemId }, "Data refresh triggered");
      break;

    case "item/error":
    case "item/login_error":
      // TODO: notificar usuário e marcar DataConnection como "error"
      logger.warn({ itemId: event.itemId, type: event.type }, "Item connection error");
      break;

    default:
      logger.warn({ type: event.type }, "Unknown webhook event type");
  }
}
