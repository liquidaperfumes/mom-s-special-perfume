import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { formatBRL } from "@/lib/kits";
import { 
  Check, Package, User, Phone, MapPin, RefreshCw, Lock, Truck, 
  ShoppingBag, MessageCircle, X, ChevronDown, Instagram, 
  Camera, FileText, Image as ImageIcon, ExternalLink, Paperclip, Clock,
  Wifi, WifiOff, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import logoImg from "@/assets/logo-liquida.png";

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
  forma_pagamento?: string;
  evidencias?: string[]; 
};

const STATUS_CONFIG: Record<PedidoStatus, { label: string; bg: string; text: string; icon: any }> = {
  pendente: { label: "Pendente", bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
  vendido: { label: "Vendido", bg: "bg-blue-100", text: "text-blue-700", icon: MessageCircle },
  entregue: { label: "Entregue", bg: "bg-emerald-100", text: "text-emerald-700", icon: Check },
  cancelado: { label: "Cancelado", bg: "bg-red-100", text: "text-red-600", icon: X },
};

function AdminPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todos" | PedidoStatus>("pendente");
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isSynced, setIsSynced] = useState(false);

  const fetchCounts = async () => {
    const { data: allData } = await supabase.from("pedidos").select("status");
    if (allData) {
      const c: Record<string, number> = { todos: allData.length };
      allData.forEach((p: any) => { c[p.status] = (c[p.status] || 0) + 1; });
      setCounts(c);
    }
  };

  const fetchPedidos = async () => {
    if (!auth) return;
    setLoading(true);

    let query = supabase.from("pedidos").select("*").order("created_at", { ascending: false });
    if (filter !== "todos") query = query.eq("status", filter);

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao carregar pedidos.");
    } else {
      setPedidos(data || []);
    }
    
    await fetchCounts();
    setLoading(false);
  };

  useEffect(() => {
    if (!auth) return;
    
    fetchPedidos();

    // REAL-TIME SUBSCRIPTION FOR INSTANT SYNC ACROSS DEVICES
    const channel = supabase
      .channel("admin-pedidos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        (payload) => {
          console.log("Real-time change received:", payload);
          
          if (payload.eventType === "INSERT") {
            const newPedido = payload.new as Pedido;
            setPedidos((current) => {
              const exists = current.find(p => p.id === newPedido.id);
              if (exists) return current;
              
              if (filter === "todos" || filter === newPedido.status) {
                return [newPedido, ...current];
              }
              return current;
            });
            toast.info(`Novo pedido de ${newPedido.cliente_nome}! 💝`, { 
              position: "top-right",
              icon: <ShoppingBag className="h-4 w-4 text-primary" />
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Pedido;
            setPedidos((current) => {
              const exists = current.find(p => p.id === updated.id);
              // If it matches filter (or filter is 'todos'), update it
              if (filter === "todos" || filter === updated.status) {
                if (exists) {
                  return current.map(p => p.id === updated.id ? updated : p);
                } else {
                  // If it's a new match for the current filter (e.g. status changed to current filter)
                  return [updated, ...current].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  );
                }
              } else {
                // If it doesn't match filter anymore, remove it
                return current.filter(p => p.id !== updated.id);
              }
            });
          } else if (payload.eventType === "DELETE") {
            setPedidos((current) => current.filter(p => p.id !== payload.old.id));
          }
          
          fetchCounts();
        }
      )
      .subscribe((status) => {
        setIsSynced(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
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

  const updateStatus = async (id: string, newStatus: PedidoStatus) => {
    const { error } = await supabase.from("pedidos").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar status.");
    } else {
      toast.success(`Status atualizado para ${newStatus}`);
    }
  };

  const addEvidence = async (id: string, url: string) => {
    const pedido = pedidos.find(p => p.id === id);
    const newEvidencias = [...(pedido?.evidencias || []), url];
    
    const { error } = await supabase.from("pedidos").update({ evidencias: newEvidencias }).eq("id", id);
    if (error) {
      toast.error("Erro ao salvar evidência.");
    } else {
      toast.success("Evidência anexada com sucesso!");
    }
  };

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-background p-8 shadow-premium">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-14 overflow-hidden">
              <img src={logoImg} alt="Liquida Perfumes" className="h-full w-auto object-contain mx-auto" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-primary">Painel da Consultora</h2>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-[0.2em] font-black">Acesso Restrito</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
              <input
                type="password"
                placeholder="Senha de acesso"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full rounded-2xl border border-input bg-secondary/20 py-4 pl-12 pr-4 text-sm outline-none ring-primary transition-all focus:ring-2"
              />
            </div>
            <button type="submit" className="w-full rounded-2xl bg-primary py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-soft transition-premium hover:bg-primary-glow hover:scale-[1.02] active:scale-[0.98]">
              Entrar no Sistema
            </button>
          </form>
          <Link to="/" className="mt-8 block text-center text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">← Voltar para o site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBFB]">
      <header className="border-b border-rose-tea/20 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            <img src={logoImg} alt="" className="h-10 w-auto" />
            <div className="h-8 w-px bg-rose-tea/30 hidden sm:block" />
            <div className="hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Gestão de Pedidos</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Campanha Dia das Mães 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider ${isSynced ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              {isSynced ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isSynced ? "Sincronizado" : "Conectando..."}
            </div>
            <button onClick={fetchPedidos} className="p-2 hover:bg-secondary rounded-full transition-premium text-primary">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setAuth(false)} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">Sair</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Olá, Consultora! 🌸</h1>
            <p className="text-sm text-muted-foreground mt-1">Gerencie seus pedidos em tempo real.</p>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {(["pendente", "vendido", "entregue", "cancelado", "todos"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] transition-premium ${
                  filter === f ? "bg-primary text-white shadow-soft" : "bg-white border border-rose-tea/20 text-muted-foreground hover:border-primary/40"
                }`}
              >
                {f === "todos" ? "Ver Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
                {counts[f] > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[8px] ${filter === f ? "bg-white/20" : "bg-secondary text-primary"}`}>{counts[f]}</span>}
              </button>
            ))}
          </div>
        </div>

        {loading && pedidos.length === 0 ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-rose-tea/20 bg-white/50">
            <Package className="h-16 w-16 text-rose-tea/20 mb-4" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pedidos.map((p) => (
              <PedidoCard key={p.id} pedido={p} onUpdate={updateStatus} onAddEvidence={addEvidence} />
            ))}
          </div>
        )}
      </main>
      
      {/* Infrastructure Status Footer */}
      <footer className="mx-auto max-w-7xl px-4 pb-8">
        <div className="rounded-2xl bg-secondary/20 p-4 flex flex-wrap items-center justify-between gap-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> DB PostgreSQL (Escalável)</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Real-time Sync Ativo</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> SSL/TLS Seguro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3" /> Monitoramento 24/7 Ativo
          </div>
        </div>
      </footer>
    </div>
  );
}

function PedidoCard({ pedido: p, onUpdate, onAddEvidence }: { pedido: Pedido; onUpdate: (id: string, s: PedidoStatus) => void, onAddEvidence: (id: string, url: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pendente;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${p.id}-${Math.random()}.${fileExt}`;
    const filePath = `evidencias/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('evidencias')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('evidencias').getPublicUrl(filePath);
      onAddEvidence(p.id, data.publicUrl);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao subir arquivo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="group flex flex-col rounded-[2.5rem] border border-rose-tea/10 bg-white p-6 shadow-soft transition-premium hover:shadow-premium hover:-translate-y-1">
      <div className="mb-5 flex items-center justify-between">
        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] ${cfg.bg} ${cfg.text}`}>
          <cfg.icon className="h-3 w-3" />
          {cfg.label}
        </div>
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
          #{p.id.slice(0, 5)} · {new Date(p.created_at).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4 bg-secondary/30 p-3 rounded-2xl">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-soft text-primary">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Cliente</p>
            <p className="text-sm font-bold truncate">{p.cliente_nome}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#25D366]/5 p-3 rounded-2xl">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-soft text-[#25D366]">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#25D366]/60">WhatsApp</p>
            <a href={`https://wa.me/${p.cliente_whatsapp}`} target="_blank" rel="noopener" className="text-sm font-bold hover:underline">{p.cliente_whatsapp}</a>
          </div>
          <ExternalLink className="h-3 w-3 text-muted-foreground/30" />
        </div>

        <div className="flex items-center gap-4 bg-rose-deep/5 p-3 rounded-2xl">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-soft text-rose-deep">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-deep/60">Entrega</p>
            <p className="text-xs font-bold truncate">
              {p.tipo_entrega === "retirada" ? "Retirada na Loja" : `${p.endereco?.bairro || '—'}`}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-rose-tea/10 pt-4 mb-6">
        <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between group/btn">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sacola ({p.itens.length})</p>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
        {expanded && (
          <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2">
            {p.itens.map((i: any, idx: number) => (
              <div key={idx} className="flex justify-between text-xs bg-secondary/20 p-2 rounded-xl border border-rose-tea/5">
                <span className="font-medium text-muted-foreground">{i.qtd}x {i.kit.nome}</span>
                <span className="font-bold text-primary">{formatBRL(i.kit.preco * i.qtd)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Evidências / Comprovantes</p>
          <button 
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"
          >
            {uploading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />}
            Anexar
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
        </div>
        
        {p.evidencias && p.evidencias.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {p.evidencias.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener" className="h-10 w-10 rounded-lg border border-rose-tea/20 overflow-hidden bg-secondary flex items-center justify-center hover:border-primary transition-colors">
                <ImageIcon className="h-4 w-4 text-primary" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[10px] italic text-muted-foreground/40">Nenhuma evidência anexada.</p>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-rose-tea/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Valor Total</p>
            <p className="text-xl font-bold text-primary">{formatBRL(p.total)}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Pagamento</p>
            <p className="text-[10px] font-bold uppercase">{p.forma_pagamento?.replace('_', ' ') || 'WhatsApp'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {p.status === "pendente" && (
            <button onClick={() => onUpdate(p.id, "vendido")} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-soft hover:bg-primary-glow transition-premium active:scale-95">
              <Check className="h-4 w-4" /> Confirmar Venda
            </button>
          )}
          {p.status === "vendido" && (
            <button onClick={() => onUpdate(p.id, "entregue")} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-soft hover:bg-emerald-700 transition-premium active:scale-95">
              <Truck className="h-4 w-4" /> Marcar como Entregue
            </button>
          )}
          {p.status !== "cancelado" && p.status !== "entregue" && (
            <button onClick={() => onUpdate(p.id, "cancelado")} className="col-span-2 border border-rose-tea/20 text-muted-foreground py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-premium">
              Cancelar Pedido
            </button>
          )}
          {p.status === "cancelado" && (
            <button onClick={() => onUpdate(p.id, "pendente")} className="col-span-2 border border-primary/20 text-primary py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-premium">
              Reabrir Pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
