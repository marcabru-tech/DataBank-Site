import { ConsentDashboard } from "@/components/consent-engine/ConsentDashboard";

export const metadata = {
  title: "Gerenciar Consentimentos — DataBank",
  description: "Visualize, revogue e exporte seus consentimentos de dados conforme a LGPD.",
};

export default function ConsentPage() {
  return (
    <main className="min-h-screen bg-slate-900 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Meus Consentimentos</h1>
        <p className="text-slate-400 mb-8">
          Gerencie as permissões que você concedeu ao DataBank e seus parceiros. Você pode revogar
          qualquer consentimento a qualquer momento, conforme o{" "}
          <strong className="text-slate-300">Art. 18 da LGPD</strong>.
        </p>
        <ConsentDashboard />
      </div>
    </main>
  );
}
