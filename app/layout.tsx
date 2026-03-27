import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DataBank – Inteligência de Dados para Startups",
  description:
    "Plataforma de analytics e inteligência de dados para startups e scale-ups que querem crescer com dados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
