"use client";

import { useState } from "react";

export interface ConsentPurpose {
  id: string;
  dataCategory: "financial" | "location" | "behavioral" | "identity";
  purpose: string;
  description: string;
  recipientId: string;
  required?: boolean;
}

export interface ConsentCheckInProps {
  purposes: ConsentPurpose[];
  onSubmit: (accepted: ConsentPurpose[]) => Promise<void>;
}

const CATEGORY_LABELS: Record<string, string> = {
  financial: "📊 Dados Financeiros",
  location: "📍 Localização",
  behavioral: "🔍 Comportamental",
  identity: "🪪 Identidade",
};

export function ConsentCheckIn({ purposes, onSubmit }: ConsentCheckInProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(purposes.filter((p) => p.required).map((p) => p.id))
  );
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const accepted = purposes.filter((p) => selected.has(p.id));
      await onSubmit(accepted);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div
        role="status"
        className="rounded-xl bg-green-900 text-green-100 p-6 text-center font-semibold"
      >
        ✅ Preferências de consentimento salvas com sucesso!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-slate-300 text-sm">
        Selecione <strong>individualmente</strong> quais dados você autoriza o DataBank a processar.
        Você pode revogar qualquer consentimento a qualquer momento.
      </p>

      {purposes.map((p) => (
        <label
          key={p.id}
          className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4 cursor-pointer hover:border-blue-500 transition-colors"
        >
          <input
            type="checkbox"
            checked={selected.has(p.id)}
            disabled={p.required}
            onChange={() => toggle(p.id)}
            aria-label={p.purpose}
            className="mt-1 accent-blue-500 w-4 h-4 shrink-0"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              {CATEGORY_LABELS[p.dataCategory] ?? p.dataCategory}
              {p.required && <span className="ml-2 normal-case text-slate-500">(obrigatório)</span>}
            </p>
            <p className="text-white font-medium mt-0.5">{p.purpose}</p>
            <p className="text-slate-400 text-sm mt-0.5">{p.description}</p>
            <p className="text-slate-500 text-xs mt-1">Compartilhado com: {p.recipientId}</p>
          </div>
        </label>
      ))}

      <button
        type="submit"
        disabled={submitting || selected.size === 0}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {submitting ? "Salvando…" : "Confirmar preferências"}
      </button>
    </form>
  );
}
