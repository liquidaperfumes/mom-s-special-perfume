
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { KITS, formatBRL, parcelas, type Kit } from "@/lib/kits";
import { useCart } from "@/lib/cart";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Plus, ArrowLeft, Share2, ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag, Star, Sparkles, Clock, MapPin, Gift, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Countdown } from "@/components/site/Countdown";

export const Route = createFileRoute("/produto/$slug")({
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = useParams({ from: "/produto/$slug" });
  const [dbProduct, setDbProduct] = useState<Kit | null>(null);
  const [loading, setLoading] = useState(true);
  const { add, setOpen } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // First check if it's in the DB
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        
        if (data) {
          setDbProduct(data as Kit);
        }
      } catch (err) {
        console.error("Erro ao buscar produto:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const kit = useMemo(() => {
    if (dbProduct) return dbProduct;
    return KITS.find(k => k.slug === slug);
  }, [dbProduct, slug]);

  const onAdd = () => {
    if (!kit) return;
    add(kit);
    setAdded(true);
    toast.success("Adicionado à sacola! 🌸");
    setTimeout(() => setAdded(false), 2000);
    setTimeout(() => setOpen(true), 500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: kit?.nome,
        text: kit?.descricao,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado!");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Produto não encontrado</h1>
          <p className="mt-2 text-muted-foreground">O kit que você procura não existe ou foi removido.</p>
          <Link to="/" className="mt-6 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-soft transition hover:scale-105">
            Voltar para a loja
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const p = parcelas(kit.preco);
  const hasDiscount = kit.precoOriginal && kit.precoOriginal > kit.preco;
  const discountPercent = hasDiscount ? Math.round(((kit.precoOriginal! - kit.preco) / kit.precoOriginal!) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          {/* Breadcrumbs / Back button */}
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar para a vitrine
          </Link>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Product Image */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-secondary/30 shadow-premium border border-rose-tea/10"
            >
              <img 
                src={kit.imagem} 
                alt={kit.nome} 
                className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
              />
              {kit.badge && (
                <span className="absolute left-6 top-6 z-10 rounded-full bg-foreground/90 px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-background backdrop-blur-md shadow-soft">
                  {kit.badge}
                </span>
              )}
              {hasDiscount && (
                <div className="absolute right-6 top-6 z-10 rounded-full bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow-soft">
                  -{discountPercent}% OFF
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2">{kit.marca}</p>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{kit.nome}</h1>
              </div>

              <div className="mb-8 flex items-end gap-4">
                <div className="flex flex-col">
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through decoration-primary/30">
                      De {formatBRL(kit.precoOriginal!)}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-primary sm:text-5xl">
                    {formatBRL(kit.preco)}
                  </span>
                </div>
                <div className="mb-1 rounded-xl bg-primary/5 px-4 py-2 border border-primary/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Em até 12x de</p>
                  <p className="text-lg font-bold text-primary">{formatBRL(p.valor)}</p>
                </div>
              </div>

              <div className="mb-10 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">O que vem no kit:</h3>
                <p className="text-base leading-relaxed text-muted-foreground/80 font-light italic">
                  "{kit.descricao}"
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button 
                  onClick={onAdd}
                  disabled={added}
                  className={`flex flex-1 items-center justify-center gap-3 rounded-full py-5 text-sm font-bold uppercase tracking-[0.2em] transition-premium shadow-soft hover:scale-[1.02] active:scale-[0.98] ${
                    added ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-primary-glow"
                  }`}
                >
                  {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                  {added ? "Adicionado!" : "Adicionar à Sacola"}
                </button>
                <button 
                  onClick={handleShare}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary transition-premium hover:bg-rose-tea/10 hover:scale-105 active:scale-95 shadow-soft"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 grid grid-cols-2 gap-6 border-t border-rose-tea/10 pt-10 sm:grid-cols-3">
                <Badge icon={<ShieldCheck className="h-4 w-4" />} text="Produto Original" />
                <Badge icon={<Truck className="h-4 w-4" />} text="Entrega Expressa" />
                <Badge icon={<RotateCcw className="h-4 w-4" />} text="Troca Garantida" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scarcity / Urgency */}
        <section className="bg-primary/5 py-10 border-y border-primary/10">
          <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Oferta por tempo limitado</span>
              <h2 className="text-2xl font-bold text-foreground">Campanha Especial de Dia das Mães</h2>
              <p className="text-sm text-muted-foreground mt-2">Garanta seu presente antes que o estoque acabe!</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">A oferta encerra em:</p>
              <Countdown />
            </div>
          </div>
        </section>

        {/* Benefits Icons Grid */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <BenefitItem 
                icon={<Sparkles className="h-6 w-6" />} 
                title="Fragrância Premium" 
                desc="Notas selecionadas para uma experiência única."
              />
              <BenefitItem 
                icon={<Clock className="h-6 w-6" />} 
                title="Alta Fixação" 
                desc="Perfume que acompanha o ritmo do dia dela."
              />
              <BenefitItem 
                icon={<Gift className="h-6 w-6" />} 
                title="Embalagem de Luxo" 
                desc="Pronto para presentear com sofisticação."
              />
              <BenefitItem 
                icon={<CreditCard className="h-6 w-6" />} 
                title="Parcelamento" 
                desc="Em até 12x sem juros no cartão."
              />
            </div>
          </div>
        </section>

        {/* Emotional Section with Large Image/Background */}
        <section className="relative h-[600px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&q=80&w=2000" 
              alt="Mãe e filha" 
              className="h-full w-full object-cover brightness-[0.4]"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Heart className="mx-auto mb-6 h-12 w-12 text-primary" />
              <h2 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">Sua mãe merece o melhor.</h2>
              <p className="text-xl font-light leading-relaxed opacity-90">
                O perfume é uma das memórias mais fortes que guardamos. Presentear com uma fragrância da Líquida Perfumes é eternizar um momento de carinho e gratidão.
              </p>
              <button 
                onClick={onAdd}
                className="mt-10 rounded-full bg-primary px-10 py-5 text-sm font-bold uppercase tracking-widest text-white shadow-premium transition hover:scale-105 active:scale-95"
              >
                Garantir este presente
              </button>
            </motion.div>
          </div>
        </section>

        {/* Testimonials / Social Proof */}
        <section className="py-24 bg-[#FDFBFB]">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">Depoimentos</span>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Quem já comprou, amou!</h2>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <TestimonialCard 
                name="Carla Mendes" 
                content="Comprei o kit para minha mãe e ela ficou encantada! A entrega foi super rápida em Olinda e o perfume é maravilhoso."
              />
              <TestimonialCard 
                name="Rodrigo Silva" 
                content="Excelente atendimento. O kit vem muito bem embalado, perfeito para presente. Minha esposa adorou a surpresa."
              />
              <TestimonialCard 
                name="Juliana Costa" 
                content="Qualidade impecável e preço justo. É difícil encontrar kits tão completos assim. Recomendo muito!"
              />
            </div>
          </div>
        </section>

        {/* Shipping info */}
        <section className="py-20 bg-white border-t border-rose-tea/10">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-2 text-[10px] font-black uppercase tracking-widest text-primary mb-6">
              <MapPin className="h-3 w-3" /> Entrega em Olinda e Recife*
            </div>
            <h2 className="text-3xl font-bold text-foreground">Receba hoje mesmo.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Realizamos entregas expressas via motoboy para que seu presente chegue a tempo. Consulte as condições para sua região no checkout.
            </p>
          </div>
        </section>

        {/* Sticky Mobile CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:hidden pointer-events-none">
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="pointer-events-auto flex items-center justify-between gap-4 rounded-3xl bg-white/80 p-4 shadow-elegant backdrop-blur-xl border border-white/20"
          >
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Valor do Kit</span>
              <span className="text-lg font-bold text-primary">{formatBRL(kit.preco)}</span>
            </div>
            <button 
              onClick={onAdd}
              className="flex-1 rounded-2xl bg-primary py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-soft active:scale-95 transition-transform"
            >
              Comprar Agora
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function BenefitItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/5 text-primary transition-premium group-hover:bg-primary group-hover:text-white group-hover:rotate-6">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-foreground mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-[200px]">{desc}</p>
    </div>
  );
}

function TestimonialCard({ name, content }: { name: string, content: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-soft border border-rose-tea/5 flex flex-col gap-4">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground italic font-light leading-relaxed">"{content}"</p>
      <div className="flex items-center gap-3 mt-2">
        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-primary">
          {name.charAt(0)}
        </div>
        <span className="text-xs font-bold text-foreground">{name}</span>
      </div>
    </div>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary">
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{text}</span>
    </div>
  );
}
