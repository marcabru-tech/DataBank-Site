"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [form, setForm] = useState({ email: "", password: "", totp: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
      totp: form.totp,
    });
    setLoading(false);
    if (result?.error) {
      setError("E-mail, senha ou código MFA inválidos.");
    } else {
      window.location.href = "/dashboard/consent";
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Entrar</h1>
        <p className="text-slate-400 text-center mb-8 text-sm">
          Acesse sua conta DataBank de forma segura.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="totp"
            placeholder="Código MFA (se habilitado)"
            value={form.totp}
            onChange={handleChange}
            maxLength={6}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <p role="alert" className="text-red-400 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="text-center text-slate-500 text-xs mt-6">
          Ao acessar, você concorda com nossa{" "}
          <a href="/privacy" className="text-blue-400 hover:underline">
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </main>
  );
}
