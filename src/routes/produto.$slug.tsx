
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { KITS, formatBRL, parcelas, type Kit } from "@/lib/kits";
import { useCart } from "@/lib/cart";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Plus, ArrowLeft, Share2, ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

        {/* Features / Details */}
        <section className="bg-secondary/20 py-20 mt-12">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <Heart className="mx-auto mb-6 h-10 w-10 text-primary animate-pulse" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Presenteie com emoção.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground font-light leading-relaxed">
              Cada kit da Líquida Perfumes é selecionado para transmitir carinho e sofisticação. Garantimos a originalidade e a qualidade que sua mãe merece.
            </p>
          </div>
        </section>
      </main>

      <Footer />
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
