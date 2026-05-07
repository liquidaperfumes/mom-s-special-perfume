import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/sucesso")({
  head: () => ({
    meta: [
      { title: "Pedido enviado! — Líquida Perfumes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Sucesso,
});

function Sucesso() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="max-w-md rounded-3xl bg-background p-10 text-center shadow-elegant">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-rose text-primary-foreground">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-display text-4xl">Pedido enviado!</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Seu pedido foi encaminhado para nosso atendimento. Em instantes você receberá no WhatsApp os dados para pagamento e a confirmação da entrega ou retirada.
        </p>
        <div className="mt-6 space-y-2">
          <a href="https://wa.me/5581997127309" target="_blank" rel="noopener" className="block w-full rounded-full bg-[#25D366] py-3.5 text-sm font-bold uppercase tracking-wider text-white">
            Abrir WhatsApp
          </a>
          <Link to="/" className="block w-full rounded-full border border-border py-3.5 text-sm font-semibold">
            Voltar para a loja
          </Link>
        </div>
      </div>
    </div>
  );
}
