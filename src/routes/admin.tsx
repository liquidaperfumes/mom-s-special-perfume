import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatBRL } from "@/lib/kits";
import { Check, Package, User, Phone, MapPin, RefreshCw, Lock, Truck, ShoppingBag, MessageCircle, X, ChevronDown, Instagram } from "lucide-react";
import { toast } from "sonner";
import logoImg from "@/assets/logo-liquida.jpg";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Painel Admin — Líquida Perfumes" }],
  }),
  component: AdminPage,
});

type PedidoStatus = "pendente" | "vendido" | "entregue" | "cancelado";

type Pedido = {
  id: string;
  created_at: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  itens: any[];
  tipo_entrega: string;
  endereco: any;
  total: number;
  status: PedidoStatus;
};

const STATUS_CONFIG: Record<PedidoStatus, { label: string; bg: string; text: string }> = {
  pendente: { label: "Pendente", bg: "bg-amber-100", text: "text-amber-700" },
  vendido: { label: "Vendido", bg: "bg-blue-100", text: "text-blue-700" },
  entregue: { label: "Entregue", bg: "bg-emerald-100", text: "text-emerald-700" },
  cancelado: { label: "Cancelado", bg: "bg-red-100", text: "text-red-600" },
};

type FilterOption = "todos" | PedidoStatus;

function AdminPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>("pendente");
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});

  const fetchPedidos = async () => {
    if (!auth) return;
    setLoading(true);

    // Fetch filtered pedidos
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

    // Fetch counts for badges
    const { data: allData } = await supabase.from("pedidos").select("status");
    if (allData) {
      const c: Record<string, number> = { todos: allData.length };
      allData.forEach((p: any) => { c[p.status] = (c[p.status] || 0) + 1; });
      setCounts(c);
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

  const updateStatus = async (id: string, newStatus: PedidoStatus, successMsg: string) => {
    const { error } = await supabase.from("pedidos").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar pedido");
    } else {
      toast.success(successMsg);
      fetchPedidos();
    }
  };

  // ------------- LOGIN SCREEN -------------
  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-background p-8 shadow-premium">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-14 overflow-hidden">
              <img src={logoImg} alt="Liquida Perfumes" className="h-full w-auto object-contain mx-auto mix-blend-multiply" />
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

  // ------------- DASHBOARD -------------
  const totalVendido = pedidos.reduce((acc, p) => p.status !== "cancelado" ? acc + p.total : acc, 0);

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 sm:h-10 overflow-hidden">
              <img src={logoImg} alt="Liquida Perfumes" className="h-full w-auto object-contain mix-blend-multiply" />
            </div>
            <div className="border-l border-border pl-3">
              <h1 className="text-xs sm:text-sm font-bold tracking-[0.2em] text-primary">ADMIN</h1>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold leading-none mt-0.5">Consultoras</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <button onClick={fetchPedidos} className="p-2 sm:p-2.5 hover:bg-secondary rounded-full transition-premium text-muted-foreground">
              <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setAuth(false)} className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">Sair</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        {/* Title + Stats */}
        <div className="mb-6 sm:mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-medium">Gestão de Pedidos</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Gerencie, dê baixa e acompanhe entregas.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10">
          <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Pendentes" value={counts.pendente || 0} color="text-amber-600" bg="bg-amber-50" />
          <StatCard icon={<MessageCircle className="h-5 w-5" />} label="Vendidos" value={counts.vendido || 0} color="text-blue-600" bg="bg-blue-50" />
          <StatCard icon={<Truck className="h-5 w-5" />} label="Entregues" value={counts.entregue || 0} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard icon={<Package className="h-5 w-5" />} label="Total Pedidos" value={counts.todos || 0} color="text-primary" bg="bg-primary/5" />
        </div>

        {/* Filters */}
        <div className="mb-6 sm:mb-8 overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 w-max sm:w-auto sm:justify-start">
            <FilterBtn active={filter === "pendente"} onClick={() => setFilter("pendente")} label="Pendentes" count={counts.pendente} />
            <FilterBtn active={filter === "vendido"} onClick={() => setFilter("vendido")} label="Vendidos" count={counts.vendido} />
            <FilterBtn active={filter === "entregue"} onClick={() => setFilter("entregue")} label="Entregues" count={counts.entregue} />
            <FilterBtn active={filter === "cancelado"} onClick={() => setFilter("cancelado")} label="Cancelados" count={counts.cancelado} />
            <FilterBtn active={filter === "todos"} onClick={() => setFilter("todos")} label="Todos" count={counts.todos} />
          </div>
        </div>

        {/* Pedidos Grid */}
        {loading && pedidos.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-background/50">
            <Package className="h-14 w-14 text-muted-foreground/20 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum pedido nesta categoria.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pedidos.map((p) => (
              <PedidoCard key={p.id} pedido={p} onUpdate={updateStatus} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ------------- COMPONENTS -------------

function PedidoCard({ pedido: p, onUpdate }: { pedido: Pedido; onUpdate: (id: string, status: PedidoStatus, msg: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pendente;

  return (
    <div className="flex flex-col rounded-2xl sm:rounded-[2rem] border border-border bg-card p-4 sm:p-6 shadow-soft transition-premium hover:shadow-premium">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
        <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          {new Date(p.created_at).toLocaleDateString('pt-BR')} · {new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Client Info */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
        <InfoRow icon={<User className="h-4 w-4" />} label="Cliente" value={p.cliente_nome} color="text-primary" />
        <InfoRow
          icon={<Phone className="h-4 w-4" />}
          label="WhatsApp"
          color="text-[#25D366]"
          value={
            <a href={`https://wa.me/${p.cliente_whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="font-bold hover:text-primary transition-colors text-sm">{p.cliente_whatsapp}</a>
          }
        />
        <InfoRow
          icon={<MapPin className="h-4 w-4" />}
          label="Entrega"
          color="text-rose-deep"
          value={
            p.tipo_entrega === "retirada"
              ? "Retirada na Loja (São Benedito)"
              : p.endereco ? `${p.endereco.rua}, ${p.endereco.num} - ${p.endereco.bairro}` : "—"
          }
        />
      </div>

      {/* Items (collapsible) */}
      <div className="border-t border-border/50 pt-4 mt-auto">
        <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between mb-3 group">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Carrinho · {p.itens.length} {p.itens.length === 1 ? "item" : "itens"}</p>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        {expanded && (
          <ul className="space-y-1.5 mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
            {p.itens.map((i: any, idx: number) => (
              <li key={idx} className="text-xs flex justify-between bg-background/50 p-2 rounded-lg border border-border/20">
                <span className="truncate flex-1 pr-2 font-medium">{i.qtd}x {i.kit.nome}</span>
                <span className="font-bold text-primary shrink-0">{formatBRL(i.kit.preco * i.qtd)}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Total */}
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-foreground text-background">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Total</span>
          <span className="font-display text-lg sm:text-xl">{formatBRL(p.total)}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 sm:mt-4 space-y-2">
          {p.status === "pendente" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <ActionBtn
                  onClick={() => onUpdate(p.id, "vendido", "Vendido via WhatsApp!")}
                  icon={<MessageCircle className="h-4 w-4" />}
                  label="WhatsApp"
                  className="bg-[#25D366] hover:bg-[#1da855]"
                />
                <ActionBtn
                  onClick={() => onUpdate(p.id, "vendido", "Vendido via Instagram!")}
                  icon={<Instagram className="h-4 w-4" />}
                  label="Instagram"
                  className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90"
                />
              </div>
              <ActionBtn
                onClick={() => onUpdate(p.id, "cancelado", "Pedido cancelado.")}
                icon={<X className="h-4 w-4" />}
                label="Cancelar Pedido"
                className="bg-transparent border border-red-200 text-red-500 hover:bg-red-50"
              />
            </>
          )}
          {p.status === "vendido" && (
            <ActionBtn
              onClick={() => onUpdate(p.id, "entregue", "Pedido marcado como entregue!")}
              icon={<Truck className="h-4 w-4" />}
              label="Marcar como Entregue"
              className="bg-emerald-600 hover:bg-emerald-700"
            />
          )}
          {p.status === "entregue" && (
            <div className="flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              <Check className="h-4 w-4" /> Pedido Finalizado
            </div>
          )}
          {p.status === "cancelado" && (
            <ActionBtn
              onClick={() => onUpdate(p.id, "pendente", "Pedido reaberto!")}
              icon={<RefreshCw className="h-4 w-4" />}
              label="Reabrir Pedido"
              className="bg-foreground hover:bg-foreground/80"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, icon, label, className }: { onClick: () => void; icon: React.ReactNode; label: string; className: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl py-3 sm:py-3.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-soft transition-premium hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {icon} {label}
    </button>
  );
}

function InfoRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-secondary/30 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
      <div className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-background shadow-soft shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <div className="text-xs sm:text-sm font-bold truncate">{value}</div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl sm:rounded-2xl p-3 sm:p-4 ${bg} border border-border/30`}>
      <div className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-background shadow-soft ${color}`}>
        {icon}
      </div>
      <div>
        <p className="font-display text-xl sm:text-2xl font-bold leading-none">{value}</p>
        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function FilterBtn({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] transition-premium ${
        active ? "bg-primary text-white shadow-soft" : "bg-background border border-border text-muted-foreground hover:border-primary/30"
      }`}
    >
      {label}
      {count != null && count > 0 && (
        <span className={`min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-[8px] font-black ${
          active ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}
