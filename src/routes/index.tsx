import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { KitsGrid } from "@/components/site/KitsGrid";
import { Emocional } from "@/components/site/Emocional";
import { Beneficios } from "@/components/site/Beneficios";

import { Loja } from "@/components/site/Loja";

import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Líquida Perfumes — Kits Dia das Mães 2026 · Frete Recife" },
      { name: "description", content: "Kits especiais de Dia das Mães com perfumes originais. Entrega em até 3h em Recife/Olinda, retirada na loja e parcelamento em até 12x. Garanta o presente perfeito." },
      { property: "og:title", content: "Transforme carinho em memória · Kits Dia das Mães" },
      { property: "og:description", content: "16 kits premium para presentear sua mãe. Originais, com embalagem pronta para presente. Entrega rápida em todo Grande Recife." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <Hero />
        <div className="bg-foreground py-3 text-center text-xs font-semibold uppercase tracking-widest text-background">
          ⚡ Estoque limitado · Compre até 08/05 e receba antes do Dia das Mães
        </div>
        <KitsGrid />
        <Emocional />
        <Beneficios />

        <Loja />

        <section className="bg-gradient-rose py-16 text-center text-primary-foreground">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="font-display text-4xl font-medium sm:text-5xl">Faça o Dia das Mães inesquecível.</h2>
            <p className="mx-auto mt-4 max-w-md text-base text-primary-foreground/90">
              Escolha o kit perfeito agora e garanta a entrega antes do domingo mais especial do ano.
            </p>
            <a href="#kits" className="mt-7 inline-flex rounded-full bg-background px-8 py-4 text-sm font-bold uppercase tracking-wider text-primary shadow-elegant transition hover:scale-[1.03]">
              Quero presentear →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
