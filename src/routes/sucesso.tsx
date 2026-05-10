import { useEffect, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Instagram, Copy, Check, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/sucesso")({
  validateSearch: (search: Record<string, unknown>) => ({
    msg: (search.msg as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Pedido enviado! — Líquida Perfumes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Sucesso,
});

const INSTAGRAM_URL = "https://www.instagram.com/liquida.perfumes/";

function Sucesso() {
  const search = useSearch({ from: "/sucesso" }) as any;
  const [copied, setCopied] = useState(false);
  
  const orderMsg = decodeURIComponent(search.msg || (typeof window !== 'undefined' ? localStorage.getItem('wa_msg') : "") || "");

  const handleCopy = async () => {
    if (!orderMsg) return;
    try {
      await navigator.clipboard.writeText(orderMsg);
      setCopied(true);
      toast.success("Resumo copiado com sucesso!");
    } catch (err) {
      // Fallback para navegadores antigos
      const textArea = document.createElement("textarea");
      textArea.value = orderMsg;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success("Resumo copiado!");
      } catch (e) {
        toast.error("Não foi possível copiar automaticamente. Por favor, selecione e copie o texto manualmente.");
      }
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: '#FDF2F3' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 sm:p-12 text-center shadow-premium border border-white"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full shadow-lg" style={{ background: 'linear-gradient(135deg, #BF355D, #D4456E)' }}>
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-primary">Pedido Registrado! 💝</h1>
        
        <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-left">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed font-bold uppercase tracking-tight">
              Atenção: Você precisa seguir os 2 passos abaixo!
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {/* Passo 1 */}
          <div className="text-left space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">1</div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Copie o Resumo do Pedido:</p>
            </div>
            
            <div className="relative rounded-3xl bg-secondary/20 p-5 border border-rose-tea/10">
              <div className="max-h-[150px] overflow-y-auto pr-2 text-[11px] font-mono text-foreground/70 whitespace-pre-wrap leading-relaxed scrollbar-hide">
                {orderMsg || "Carregando resumo..."}
              </div>
              <button 
                onClick={handleCopy}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all shadow-soft active:scale-95 ${
                  copied ? "bg-emerald-500 text-white" : "bg-white text-primary border border-primary/10 hover:bg-primary/5"
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Resumo Copiado!" : "Clique para Copiar Resumo"}
              </button>
            </div>
          </div>

          {/* Passo 2 */}
          <AnimatePresence>
            {copied && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-2"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">2</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-left">Agora envie no Instagram:</p>
                </div>

                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center justify-center gap-3 w-full rounded-full py-5 text-base font-black uppercase tracking-wider text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
                >
                  <Instagram className="h-6 w-6" /> 
                  Finalizar no Instagram
                  <Sparkles className="h-4 w-4 text-white/50" />
                </a>

                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] animate-pulse">
                  Não esqueça de COLAR a mensagem no chat!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-8 border-t border-gray-100">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
            >
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
