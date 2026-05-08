import { useEffect, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/sucesso")({
  head: () => ({
    meta: [
      { title: "Pedido enviado! — Líquida Perfumes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Sucesso,
});

const WHATSAPP_CONSULTORA = "5581995811306";
const WHATSAPP_DISPLAY = "(81) 99581-1306";

function Sucesso() {
  const search = useSearch({ from: "/sucesso" }) as any;
  const [waUrl] = useState(() => {
    // 1. Check URL first (highest priority)
    if (search.msg) {
      return `https://wa.me/${WHATSAPP_CONSULTORA}?text=${search.msg}`;
    }
    // 2. Check localStorage
    const localMsg = typeof window !== 'undefined' ? localStorage.getItem('wa_msg') : null;
    if (localMsg) {
      return `https://wa.me/${WHATSAPP_CONSULTORA}?text=${encodeURIComponent(localMsg)}`;
    }
    return `https://wa.me/${WHATSAPP_CONSULTORA}`;
  });

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
        
        <h1 className="mt-8 text-4xl font-bold tracking-tight" style={{ color: '#BF355D' }}>Pedido Salvo! 💝</h1>
        
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100/50">
          <p className="text-sm leading-relaxed text-emerald-800 font-medium">
            Falta apenas um passo! Para <span className="font-bold underline">garantir seu presente</span>, clique no botão abaixo para nos enviar os dados pelo WhatsApp.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <motion.a
            href={waUrl}
            target="_blank"
            rel="noopener"
            initial={{ scale: 1 }}
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 0 0px rgba(37, 211, 102, 0.4)",
                "0 0 0 15px rgba(37, 211, 102, 0)",
                "0 0 0 0px rgba(37, 211, 102, 0)"
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex items-center justify-center gap-3 w-full rounded-full py-5 text-base font-black uppercase tracking-wider text-white shadow-xl transition-all"
            style={{ background: '#25D366' }}
          >
            <MessageCircle className="h-6 w-6" /> 
            Finalizar no WhatsApp
            <Sparkles className="h-4 w-4 text-white/50" />
          </motion.a>
          
          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Consultora Oficial</p>
            <p className="text-xs font-black text-gray-600">{WHATSAPP_DISPLAY}</p>
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
