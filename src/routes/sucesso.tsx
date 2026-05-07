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
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="max-w-md rounded-3xl bg-background p-10 text-center shadow-elegant">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-rose text-primary-foreground">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-display text-4xl">Pedido enviado!</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Seu pedido foi encaminhado para nossa consultora. Em instantes você receberá no WhatsApp a confirmação do pagamento e os detalhes da entrega.
        </p>
        <div className="mt-6 space-y-2">
          <a href={`https://wa.me/${WHATSAPP_CONSULTORA}`} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 w-full rounded-full bg-[#25D366] py-3.5 text-sm font-bold uppercase tracking-wider text-white">
            <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
          </a>
          <p className="text-xs text-muted-foreground">Consultora: {WHATSAPP_DISPLAY}</p>
          <Link to="/" className="block w-full rounded-full border border-border py-3.5 text-sm font-semibold">
            Voltar para a loja
          </Link>
        </div>
      </div>
    </div>
  );
}
