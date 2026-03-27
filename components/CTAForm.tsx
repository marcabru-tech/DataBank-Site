"use client";

import { useState } from "react";

type FormState = "idle" | "sending" | "ok" | "error";

export default function CTAForm() {
  const [state, setState] = useState<FormState>("idle");
  const [form, setForm] = useState({ name: "", email: "", use_case: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setState("ok");
    } catch {
      setState("error");
    }
  };

  return (
    <section id="cta" className="py-20 px-6 bg-slate-900">
      <div className="max-w-xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Solicite acesso antecipado
        </h2>
        <p className="text-slate-400 text-center mb-10">
          Entre na lista de espera e garanta condições especiais de fundadores.
        </p>

        {state === "ok" ? (
          <div
            role="status"
            className="bg-green-800 text-green-100 rounded-xl p-6 text-center font-semibold"
          >
            ✅ Recebemos seu interesse! Entraremos em contato em breve.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Seu nome"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="email"
              placeholder="E-mail corporativo"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              name="use_case"
              placeholder="Como você pretende usar o DataBank?"
              rows={4}
              value={form.use_case}
              onChange={handleChange}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {state === "error" && (
              <p role="alert" className="text-red-400 text-sm text-center">
                Ocorreu um erro. Tente novamente.
              </p>
            )}
            <button
              type="submit"
              disabled={state === "sending"}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {state === "sending" ? "Enviando…" : "Solicitar acesso"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
