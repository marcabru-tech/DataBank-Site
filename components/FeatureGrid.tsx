const features = [
  {
    icon: "⚡",
    title: "Tempo real",
    description: "Dashboards atualizados em segundos, não em horas.",
  },
  {
    icon: "🔒",
    title: "Segurança enterprise",
    description: "Criptografia end-to-end e conformidade com LGPD/GDPR.",
  },
  {
    icon: "🤖",
    title: "IA integrada",
    description: "Previsões automáticas e detecção de anomalias com ML.",
  },
  {
    icon: "📊",
    title: "Relatórios customizáveis",
    description: "Crie, salve e compartilhe relatórios sem código.",
  },
  {
    icon: "🔗",
    title: "200+ integrações",
    description: "Conecte Stripe, HubSpot, BigQuery, PostgreSQL e muito mais.",
  },
  {
    icon: "🚀",
    title: "Setup em 5 minutos",
    description: "Da criação da conta ao primeiro insight em menos de 5 min.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
          Tudo que você precisa para decidir melhor
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
