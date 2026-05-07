import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatBRL } from "@/lib/kits";
import { Check, Clock, Package, User, Phone, MapPin, RefreshCw, LogIn, Lock } from "lucide-react";
import { toast } from "sonner";
import logoImg from "@/assets/logo-liquida.jpg";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Painel Admin — Líquida Perfumes" }],
  }),
  component: AdminPage,
});

type Pedido = {
  id: string;
  created_at: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  itens: any[];
  tipo_entrega: string;
  endereco: any;
  total: number;
  status: "pendente" | "concluido" | "cancelado";
};

function AdminPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todos" | "pendente" | "concluido">("pendente");
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");

  const fetchPedidos = async () => {
    if (!auth) return;
    setLoading(true);
    let query = supabase.from("pedidos").select("*").order("created_at", { ascending: false });
    
    if (filter !== "todos") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao carregar pedidos");
    } else {
      setPedidos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPedidos();
  }, [filter, auth]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === "liquida2026") {
      setAuth(true);
      toast.success("Acesso liberado");
    } else {
      toast.error("Senha incorreta");
    }
  };

  const darBaixa = async (id: string) => {
    const { error } = await supabase.from("pedidos").update({ status: "concluido" }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar pedido");
    } else {
      toast.success("Pedido concluído com sucesso!");
      fetchPedidos();
    }
  };

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-background p-8 shadow-premium">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-primary/20 shadow-soft bg-white">
              <img src={logoImg} alt="Liquida Perfumes" className="h-full w-full object-cover" />
            </div>
            <h2 className="font-display text-2xl">Acesso Restrito</h2>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-bold">Painel de Consultoras</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                placeholder="Digite a senha"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full rounded-2xl border border-input bg-secondary/20 py-4 pl-12 pr-4 text-sm outline-none ring-primary transition-all focus:ring-2"
              />
            </div>
            <button type="submit" className="w-full rounded-2xl bg-primary py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-soft transition-premium hover:scale-[1.02] active:scale-[0.98]">
              Entrar no Painel
            </button>
          </form>
          <div className="mt-8 text-center">
            <Link to="/" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">← Voltar para o site</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-primary/20 shadow-soft bg-white">
              <img src={logoImg} alt="Liquida Perfumes" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] text-primary">ADMIN</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold leading-none mt-1">Consultoras</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={fetchPedidos} className="p-2.5 hover:bg-secondary rounded-full transition-premium text-muted-foreground">
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setAuth(false)} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">Sair</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-4xl font-medium">Pedidos Recebidos</h2>
            <p className="text-sm text-muted-foreground mt-1">Gerencie as solicitações enviadas via site.</p>
          </div>
          <div className="flex bg-background/50 backdrop-blur-sm p-1 rounded-2xl border border-border/50 shadow-soft">
            <FilterBtn active={filter === "pendente"} onClick={() => setFilter("pendente")} label="Pendentes" />
            <FilterBtn active={filter === "concluido"} onClick={() => setFilter("concluido")} label="Concluídos" />
            <FilterBtn active={filter === "todos"} onClick={() => setFilter("todos")} label="Todos" />
          </div>
        </div>

        {loading && pedidos.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-border bg-background/50">
            <Package className="h-14 w-14 text-muted-foreground/20 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum pedido encontrado nesta categoria.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pedidos.map((p) => (
              <div key={p.id} className="group relative flex flex-col rounded-[2rem] border border-border bg-card p-6 shadow-soft transition-premium hover:shadow-premium hover:-translate-y-1">
                <div className="mb-6 flex items-center justify-between">
                  <span className={`rounded-full px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] ${
                    p.status === "pendente" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {p.status}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                    {new Date(p.created_at).toLocaleDateString('pt-BR')} · {new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center gap-4 bg-secondary/30 p-3 rounded-2xl">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-background text-primary shadow-soft">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cliente</p>
                      <p className="text-sm font-bold truncate">{p.cliente_nome}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-secondary/30 p-3 rounded-2xl">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-background text-[#25D366] shadow-soft">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">WhatsApp</p>
                      <a href={`https://wa.me/${p.cliente_whatsapp.replace(/\D/g, '')}`} target="_blank" className="text-sm font-bold hover:text-primary transition-colors">{p.cliente_whatsapp}</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-secondary/30 p-4 rounded-2xl">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-background text-rose-deep shadow-soft shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Entrega</p>
                      <p className="text-xs font-semibold leading-relaxed mt-0.5">
                        {p.tipo_entrega === "retirada" ? (
                          <span className="text-foreground">Retirada na Loja (São Benedito)</span>
                        ) : (
                          `${p.endereco.rua}, ${p.endereco.num} - ${p.endereco.bairro}`
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-5 mt-auto">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Carrinho</p>
                      <span className="text-[10px] font-bold text-muted-foreground">{p.itens.length} itens</span>
                    </div>
                    <ul className="space-y-2">
                      {p.itens.map((i: any, idx: number) => (
                        <li key={idx} className="text-xs flex justify-between bg-background/50 p-2 rounded-lg border border-border/20">
                          <span className="truncate flex-1 pr-2 font-medium">{i.qtd}x {i.kit.nome}</span>
                          <span className="font-bold text-primary">{formatBRL(i.kit.preco * i.qtd)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-foreground text-background">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Total do Pedido</span>
                    <span className="font-display text-xl">{formatBRL(p.total)}</span>
                  </div>

                  {p.status === "pendente" && (
                    <button
                      onClick={() => darBaixa(p.id)}
                      className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-soft transition-premium hover:scale-[1.02] active:scale-[0.98] hover:bg-primary-glow"
                    >
                      <Check className="h-4 w-4" /> Dar Baixa no Pedido
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-premium ${
        active ? "bg-primary text-white shadow-soft" : "text-muted-foreground hover:bg-background/80"
      }`}
    >
      {label}
    </button>
  );
}
