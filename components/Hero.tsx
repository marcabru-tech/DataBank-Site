export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <span className="inline-block bg-blue-600 text-white text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
          Beta – Vagas limitadas
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Dados que <span className="text-blue-400">impulsionam</span> startups
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
          DataBank transforma dados brutos em inteligência acionável — dashboards, alertas e
          insights em tempo real para times que não podem esperar.
        </p>
        <a
          href="#cta"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
        >
          Solicitar acesso antecipado
        </a>
      </div>
    </section>
  );
}
