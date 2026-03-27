"use client";

import { useEffect, useState, useCallback } from "react";
import { ConsentCard, ConsentCardProps } from "./ConsentCard";

interface ConsentDashboardProps {
  /** Permite sobrescrever o fetcher para testes */
  fetcher?: () => Promise<ConsentCardProps[]>;
}

export function ConsentDashboard({ fetcher }: ConsentDashboardProps) {
  const [consents, setConsents] = useState<ConsentCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "revoked">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (fetcher) {
        setConsents(await fetcher());
      } else {
        const params = filter !== "all" ? `?status=${filter}` : "";
        const res = await fetch(`/api/consent${params}`);
        if (!res.ok) throw new Error("Falha ao carregar consentimentos");
        const data = (await res.json()) as { consents: ConsentCardProps[] };
        setConsents(data.consents);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [fetcher, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRevoke = async (id: string) => {
    const res = await fetch(`/api/consent/${id}`, { method: "PATCH" });
    if (!res.ok) throw new Error("Falha ao revogar consentimento");
    setConsents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "revoked" as const } : c))
    );
  };

  const handleExport = async () => {
    const res = await fetch("/api/consent/export");
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "databank-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(["all", "active", "revoked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Revogados"}
            </button>
          ))}
        </div>

        <button
          onClick={handleExport}
          className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
        >
          ⬇ Exportar meus dados (LGPD)
        </button>
      </div>

      {loading && <p className="text-slate-400 text-center py-8">Carregando consentimentos…</p>}

      {error && (
        <p role="alert" className="text-red-400 text-center py-4">
          {error}
        </p>
      )}

      {!loading && !error && consents.length === 0 && (
        <p className="text-slate-400 text-center py-8">Nenhum consentimento encontrado.</p>
      )}

      {!loading && !error && consents.length > 0 && (
        <div className="grid gap-4">
          {consents.map((c) => (
            <ConsentCard
              key={c.id}
              {...c}
              onRevoke={c.status === "active" ? handleRevoke : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
