import { useEffect, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Instagram, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/sucesso")({
  head: () => ({
    meta: [
      { title: "Pedido enviado! — Líquida Perfumes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Sucesso,
});

const INSTAGRAM_DIRECT_URL = "https://ig.me/m/liquida.perfumes";

function Sucesso() {
  const search = useSearch({ from: "/sucesso" }) as any;
  const [copied, setCopied] = useState(false);
  
  const orderMsg = decodeURIComponent(search.msg || localStorage.getItem('wa_msg') || "");

  const handleCopy = () => {
    if (!orderMsg) return;
    navigator.clipboard.writeText(orderMsg);
    setCopied(true);
    toast.success("Resumo do pedido copiado!");
    setTimeout(() => setCopied(false), 3000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: '#FDF2F3' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[2.5rem] bg-white p-8 sm:p-12 text-center shadow-[0_25px_60px_-20px_rgba(191,53,93,0.20)] border border-white"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full shadow-lg" style={{ background: 'linear-gradient(135deg, #BF355D, #D4456E)' }}>
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        
        <h1 className="mt-8 text-4xl font-bold tracking-tight" style={{ color: '#BF355D' }}>Quase lá! 💝</h1>
        
        <div className="mt-6 p-5 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="text-sm leading-relaxed text-foreground/80">
            Seu pedido foi registrado. Agora, <span className="font-bold">copie o resumo abaixo</span> e envie no nosso <span className="font-bold">Direct do Instagram</span> para finalizar!
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-3 w-full rounded-full py-5 text-sm font-black uppercase tracking-wider transition-all shadow-soft active:scale-95 ${
              copied ? "bg-emerald-500 text-white" : "bg-secondary text-primary hover:bg-rose-tea/10"
            }`}
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            {copied ? "Resumo Copiado!" : "1. Copiar Resumo"}
          </button>

          <motion.a
            href={INSTAGRAM_DIRECT_URL}
            target="_blank"
            rel="noopener"
            initial={{ scale: 1 }}
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex items-center justify-center gap-3 w-full rounded-full py-5 text-base font-black uppercase tracking-wider text-white shadow-xl transition-all"
            style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
          >
            <Instagram className="h-6 w-6" /> 
            2. Enviar no Direct
            <Sparkles className="h-4 w-4 text-white/50" />
          </motion.a>
          
          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Perfil Oficial</p>
            <p className="text-xs font-black text-gray-600">@liquida.perfumes</p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <Link
              to="/"
              className="block w-full rounded-full border border-gray-200 py-4 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-primary hover:border-primary/20 transition-all"
            >
              ← Voltar para a loja
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
