"use client";

import { useState } from "react";

export type ConsentStatus = "active" | "revoked" | "expired";

export interface ConsentCardProps {
  id: string;
  dataCategory: string;
  purpose: string;
  recipientId: string;
  status: ConsentStatus;
  grantedAt: string;
  expiresAt?: string | null;
  onRevoke?: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  financial: "Dados Financeiros",
  location: "Localização",
  behavioral: "Comportamental",
  identity: "Identidade",
};

const STATUS_STYLES: Record<ConsentStatus, string> = {
  active: "bg-green-900 text-green-200",
  revoked: "bg-red-900 text-red-200",
  expired: "bg-slate-700 text-slate-300",
};

export function ConsentCard({
  id,
  dataCategory,
  purpose,
  recipientId,
  status,
  grantedAt,
  expiresAt,
  onRevoke,
}: ConsentCardProps) {
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    if (!onRevoke) return;
    setRevoking(true);
    try {
      await onRevoke(id);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div
      data-testid="consent-card"
      className="rounded-xl border border-slate-700 bg-slate-800 p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            {CATEGORY_LABELS[dataCategory] ?? dataCategory}
          </span>
          <p className="mt-1 text-white font-medium">{purpose}</p>
          <p className="text-slate-400 text-sm mt-1">Receptor: {recipientId}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[status]}`}
        >
          {status === "active" ? "Ativo" : status === "revoked" ? "Revogado" : "Expirado"}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
        <span>Concedido em: {new Date(grantedAt).toLocaleDateString("pt-BR")}</span>
        {expiresAt && <span>Expira em: {new Date(expiresAt).toLocaleDateString("pt-BR")}</span>}
      </div>

      {status === "active" && onRevoke && (
        <button
          onClick={handleRevoke}
          disabled={revoking}
          aria-label={`Revogar consentimento para ${purpose}`}
          className="self-start mt-1 text-sm text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors underline underline-offset-2"
        >
          {revoking ? "Revogando…" : "Revogar consentimento"}
        </button>
      )}
    </div>
  );
}
