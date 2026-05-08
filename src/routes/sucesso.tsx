import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle } from "lucide-react";

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
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: '#FDF2F3' }}>
      <div className="w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 text-center shadow-[0_25px_60px_-20px_rgba(191,53,93,0.20)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #BF355D, #D4456E)' }}>
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-5 text-4xl font-bold tracking-tight" style={{ color: '#BF355D' }}>Pedido enviado!</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Seu pedido foi encaminhado para nossa consultora. Em instantes você receberá no WhatsApp a confirmação do pagamento e os detalhes da entrega.
        </p>
        <div className="mt-6 space-y-3">
          <a
            href={`https://wa.me/${WHATSAPP_CONSULTORA}`}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2 w-full rounded-full py-4 text-sm font-bold uppercase tracking-wider text-white"
            style={{ background: '#25D366' }}
          >
            <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
          </a>
          <p className="text-xs text-gray-400">Consultora: {WHATSAPP_DISPLAY}</p>
          <Link
            to="/"
            className="block w-full rounded-full border border-gray-200 py-4 text-sm font-semibold text-gray-600 hover:border-primary/30 transition-colors"
          >
            Voltar para a loja
          </Link>
        </div>
      </div>
    </div>
  );
}
