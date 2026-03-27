export const metadata = {
  title: "Centro de Privacidade — DataBank",
  description:
    "Entenda como o DataBank coleta, processa e compartilha seus dados em conformidade com a LGPD e o Open Finance.",
};

const dataTypes = [
  {
    category: "Dados Financeiros",
    icon: "📊",
    uses: [
      "Análise de perfil de crédito",
      "Recomendações personalizadas",
      "Relatórios de saúde financeira",
    ],
    legal: "Art. 7º, V — execução de contrato",
  },
  {
    category: "Dados de Identidade",
    icon: "🪪",
    uses: ["Verificação KYC", "Prevenção a fraudes", "Onboarding regulatório"],
    legal: "Art. 7º, II — consentimento explícito",
  },
  {
    category: "Dados Comportamentais",
    icon: "🔍",
    uses: ["Melhoria da experiência", "Detecção de anomalias", "Personalização de alertas"],
    legal: "Art. 7º, II — consentimento explícito",
  },
];

const rights = [
  { right: "Confirmação", desc: "Saber se tratamos seus dados" },
  { right: "Acesso", desc: "Receber cópia dos dados armazenados" },
  { right: "Correção", desc: "Atualizar dados incompletos ou inexatos" },
  { right: "Anonimização / Eliminação", desc: "Solicitar remoção quando aplicável" },
  { right: "Portabilidade", desc: "Exportar seus dados em formato interoperável" },
  { right: "Revogação", desc: "Retirar consentimentos a qualquer momento" },
  { right: "Informação", desc: "Saber com quem compartilhamos seus dados" },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-16">
        {/* Header */}
        <header className="text-center">
          <span className="inline-block bg-blue-600 text-white text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Privacy by Design
          </span>
          <h1 className="text-4xl font-extrabold mb-4">Centro de Privacidade</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Transparência total sobre como o DataBank processa seus dados, em conformidade com a{" "}
            <strong className="text-white">LGPD (Lei nº 13.709/2018)</strong> e a{" "}
            <strong className="text-white">Resolução Conjunta nº 1 BACEN/CMN</strong>.
          </p>
        </header>

        {/* Controlador */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Controlador de Dados</h2>
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 space-y-2">
            <p>
              <span className="text-slate-400">Empresa:</span> DataBank Tecnologia Financeira Ltda.
            </p>
            <p>
              <span className="text-slate-400">CNPJ:</span> A ser registrado (pré-operação)
            </p>
            <p>
              <span className="text-slate-400">DPO:</span>{" "}
              <a
                href="mailto:privacidade@databank.com.br"
                className="text-blue-400 hover:underline"
              >
                privacidade@databank.com.br
              </a>
            </p>
            <p>
              <span className="text-slate-400">Endereço:</span> São Paulo, SP, Brasil
            </p>
          </div>
        </section>

        {/* Dados processados */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Dados que Processamos e Como os Usamos</h2>
          <div className="grid gap-4">
            {dataTypes.map((dt) => (
              <div
                key={dt.category}
                className="rounded-xl border border-slate-700 bg-slate-800 p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{dt.icon}</span>
                  <h3 className="text-lg font-semibold">{dt.category}</h3>
                </div>
                <ul className="space-y-1 mb-3">
                  {dt.uses.map((u) => (
                    <li key={u} className="flex items-start gap-2 text-slate-300 text-sm">
                      <span className="text-blue-400 mt-0.5">•</span>
                      {u}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-500">Base legal: {dt.legal}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Direitos */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Seus Direitos (Art. 18 LGPD)</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {rights.map((r) => (
              <div key={r.right} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <p className="font-semibold text-blue-400">{r.right}</p>
                <p className="text-slate-300 text-sm mt-1">{r.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-slate-400 text-sm">
            Para exercer qualquer direito, acesse{" "}
            <a href="/dashboard/consent" className="text-blue-400 hover:underline">
              Gerenciar Consentimentos
            </a>{" "}
            ou entre em contato com nosso DPO.
          </p>
        </section>

        {/* Retenção */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Retenção e Segurança</h2>
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 space-y-3 text-slate-300 text-sm">
            <p>
              Os dados são retidos pelo tempo necessário à prestação do serviço ou conforme
              obrigação legal (ex.: 5 anos para dados fiscais, per BACEN).
            </p>
            <p>
              Todos os consentimentos são registrados em log de auditoria imutável (append-only),
              garantindo rastreabilidade para a ANPD.
            </p>
            <p>
              Adotamos criptografia em trânsito (TLS 1.3) e em repouso, controle de acesso baseado
              em princípio do menor privilégio, e autenticação multifator obrigatória para equipe
              técnica.
            </p>
          </div>
        </section>

        {/* Open Finance */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Open Finance e Compartilhamento</h2>
          <p className="text-slate-400 text-sm">
            As conexões com dados bancários seguem a{" "}
            <strong className="text-white">Resolução Conjunta nº 1 BACEN/CMN</strong> e são
            intermediadas por provedores certificados (Pluggy / Belvo). O DataBank age como
            Instituição Receptora de Dados (IRD) e jamais armazena credenciais bancárias.
          </p>
        </section>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/dashboard/consent"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Gerenciar meus consentimentos
          </a>
        </div>
      </div>
    </main>
  );
}
