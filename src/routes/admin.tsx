import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { formatBRL } from "@/lib/kits";
import { 
  Check, Package, User, Phone, MapPin, RefreshCw, Lock, Truck, 
  ShoppingBag, MessageCircle, X, ChevronDown, Instagram, 
  Camera, FileText, Image as ImageIcon, ExternalLink, Paperclip, Clock,
  Wifi, WifiOff, AlertCircle, Search, Copy, DollarSign, TrendingUp, Filter,
  Edit2, Save, Undo, Sparkles
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
  const [searchTerm, setSearchTerm] = useState("");
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingAuth(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const delivered = pedidos.filter(p => p.status === "entregue");
    const pending = pedidos.filter(p => p.status === "pendente" || p.status === "vendido");
    
    // Most ordered product logic
    const productCounts: Record<string, number> = {};
    pedidos.forEach(p => {
      if (p.status !== "cancelado" && Array.isArray(p.itens)) {
        p.itens.forEach((it: any) => {
          const name = it?.kit?.nome;
          if (name) {
            productCounts[name] = (productCounts[name] || 0) + it.qtd;
          }
        });
      }
    });
    
    let mostOrdered = "—";
    let maxQty = 0;
    Object.entries(productCounts).forEach(([name, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        mostOrdered = name;
      }
    });

    return {
      totalVendas: delivered.reduce((acc, p) => acc + (p.total || 0), 0),
      valorPendente: pending.reduce((acc, p) => acc + (p.total || 0), 0),
      totalPedidos: counts.todos || 0,
      maisPedido: mostOrdered
    };
  }, [pedidos, counts]);

  const filteredPedidos = useMemo(() => {
    return pedidos.filter(p => 
      (p.cliente_nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.cliente_whatsapp || "").includes(searchTerm) ||
      (p.id || "").includes(searchTerm)
    );
  }, [pedidos, searchTerm]);

  const fetchCounts = async () => {
    const { data: allData } = await supabase.from("pedidos").select("status");
    if (allData) {
      const c: Record<string, number> = { todos: allData.length };
      allData.forEach((p: any) => { c[p.status] = (c[p.status] || 0) + 1; });
      setCounts(c);
    }
  };

  const fetchPedidos = async () => {
    if (!session) return;
    setLoading(true);

    let query = supabase.from("pedidos").select("*").order("created_at", { ascending: false });
    
    // If searching, ignore status filter to allow global search
    if (searchTerm) {
      // Searching by name, whatsapp or ID using DB filters for efficiency
      query = query.or(`cliente_nome.ilike.%${searchTerm}%,cliente_whatsapp.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);
    } else if (filter !== "todos") {
      query = query.eq("status", filter);
    }

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
    if (!session) return;
    fetchPedidos();

    const channel = supabase
      .channel("admin-pedidos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newPedido = payload.new as Pedido;
            setPedidos((current) => {
              const exists = current.find(p => p.id === newPedido.id);
              if (exists) return current;
              if (filter === "todos" || filter === newPedido.status) return [newPedido, ...current];
              return current;
            });
            toast.info(`Novo pedido de ${newPedido.cliente_nome}! 💝`, { position: "top-right" });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Pedido;
            setPedidos((current) => {
              const exists = current.find(p => p.id === updated.id);
              if (filter === "todos" || filter === updated.status) {
                if (exists) return current.map(p => p.id === updated.id ? updated : p);
                return [updated, ...current].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              }
              return current.filter(p => p.id !== updated.id);
            });
          } else if (payload.eventType === "DELETE") {
            setPedidos((current) => current.filter(p => p.id !== payload.old.id));
          }
          fetchCounts();
        }
      )
      .subscribe((status) => setIsSynced(status === "SUBSCRIBED"));

    return () => { supabase.removeChannel(channel); };
  }, [filter, session, searchTerm]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Autenticando...");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    
    if (error) {
      toast.error("E-mail ou senha incorretos", { id: toastId });
    } else {
      toast.success("Acesso liberado", { id: toastId });
    }
  };

  const updateStatus = async (id: string, newStatus: PedidoStatus) => {
    const { error } = await supabase.from("pedidos").update({ status: newStatus }).eq("id", id);
    if (error) toast.error("Erro ao atualizar status.");
    else toast.success(`Status atualizado para ${newStatus}`);
  };

  const updatePedido = async (id: string, updates: Partial<Pedido>) => {
    const { error } = await supabase.from("pedidos").update(updates).eq("id", id);
    if (error) toast.error("Erro ao atualizar pedido.");
    else toast.success("Pedido atualizado com sucesso!");
  };

  const addEvidence = async (id: string, url: string) => {
    const pedido = pedidos.find(p => p.id === id);
    const newEvidencias = [...(pedido?.evidencias || []), url];
    const { error } = await supabase.from("pedidos").update({ evidencias: newEvidencias }).eq("id", id);
    if (error) toast.error("Erro ao salvar evidência.");
    else toast.success("Evidência anexada com sucesso!");
  };

  if (loadingAuth) {
    return <div className="flex min-h-screen items-center justify-center bg-secondary/30" />
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-sm:px-0 max-w-sm rounded-3xl border border-border bg-background p-8 shadow-premium">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-14 overflow-hidden"><img src={logoImg} alt="Liquida Perfumes" className="h-full w-auto object-contain mx-auto" /></div>
            <h2 className="text-2xl font-bold tracking-tight text-primary">Painel da Consultora</h2>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-[0.2em] font-black">Acesso Restrito</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
              <input type="email" required placeholder="E-mail de acesso" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-input bg-secondary/20 py-4 pl-12 pr-4 text-sm outline-none ring-primary transition-all focus:ring-2" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
              <input type="password" required placeholder="Senha" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full rounded-2xl border border-input bg-secondary/20 py-4 pl-12 pr-4 text-sm outline-none ring-primary transition-all focus:ring-2" />
            </div>
            <button type="submit" className="w-full rounded-2xl bg-primary py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-soft transition-premium hover:bg-primary-glow hover:scale-[1.02] active:scale-[0.98]">Entrar no Sistema</button>
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
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Gestão de Pedidos</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest hidden sm:block">Campanha Dia das Mães 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider ${isSynced ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              {isSynced ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isSynced ? "Sincronizado" : "Conectando..."}
            </div>
            <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">Sair</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<TrendingUp className="text-emerald-500" />} label="Vendas Entregues" value={formatBRL(stats.totalVendas)} />
          <StatCard icon={<Clock className="text-amber-500" />} label="Valor em Aberto" value={formatBRL(stats.valorPendente)} />
          <StatCard icon={<Package className="text-blue-500" />} label="Total Pedidos" value={stats.totalPedidos.toString()} />
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-full flex flex-col justify-center rounded-3xl border border-rose-tea/10 bg-white p-6 shadow-soft transition-premium hover:shadow-premium">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-3 w-3 text-gold" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">O Queridinho</p>
              </div>
              <p className="text-sm font-bold text-primary truncate" title={stats.maisPedido}>{stats.maisPedido}</p>
            </div>
          </div>

        </div>

        <div className="mb-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Pedidos 🌸</h1>
              <p className="text-sm text-muted-foreground mt-1">Localize e gerencie as vendas do dia.</p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar cliente ou WhatsApp..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-rose-tea/10 bg-white py-3.5 pl-12 pr-4 text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-soft"
              />
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {(["pendente", "vendido", "entregue", "cancelado", "todos"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-[10px] font-black uppercase tracking-[0.1em] transition-premium ${
                  filter === f ? "bg-primary text-white shadow-soft" : "bg-white border border-rose-tea/20 text-muted-foreground hover:border-primary/40"
                }`}
              >
                {f === "todos" ? "Ver Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
                {counts[f] > 0 && <span className={`rounded-full px-2 py-0.5 text-[8px] ${filter === f ? "bg-white/20" : "bg-secondary text-primary"}`}>{counts[f]}</span>}
              </button>
            ))}
          </div>
        </div>

        {loading && pedidos.length === 0 ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredPedidos.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-rose-tea/20 bg-white/50">
            <Package className="h-16 w-16 text-rose-tea/20 mb-4" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPedidos.map((p) => (
              <PedidoCard key={p.id} pedido={p} onUpdate={updateStatus} onAddEvidence={addEvidence} onSave={updatePedido} />
            ))}
          </div>
        )}
      </main>
      
      <footer className="mx-auto max-w-7xl px-4 pb-8">
        <div className="rounded-2xl bg-secondary/20 p-4 flex flex-wrap items-center justify-between gap-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> PostgreSQL + Real-time Sync</span>
            <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> SSL/TLS Ativo</span>
          </div>
          <div className="flex items-center gap-1.5"><AlertCircle className="h-3 w-3" /> Monitoramento 24/7</div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-rose-tea/10 bg-white p-6 shadow-soft transition-premium hover:shadow-premium">
      <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-secondary/30">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function PedidoCard({ pedido: p, onUpdate, onAddEvidence, onSave }: { pedido: Pedido; onUpdate: (id: string, s: PedidoStatus) => void, onAddEvidence: (id: string, url: string) => void, onSave: (id: string, updates: Partial<Pedido>) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ nome: p.cliente_nome, whatsapp: p.cliente_whatsapp, bairro: p.endereco?.bairro || "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pendente;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fileName = `${p.id}-${Math.random()}.${file.name.split('.').pop()}`;
    try {
      const { error: uploadError } = await supabase.storage.from('evidencias').upload(`evidencias/${fileName}`, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('evidencias').getPublicUrl(`evidencias/${fileName}`);
      onAddEvidence(p.id, data.publicUrl);
    } catch (error) { toast.error("Erro ao subir arquivo."); } finally { setUploading(false); }
  };

  const copyAddress = () => {
    if (!p.endereco) return;
    const text = `${p.cliente_nome}\n${p.endereco.rua}, ${p.endereco.numero}${p.endereco.complemento ? ' - ' + p.endereco.complemento : ''}\n${p.endereco.bairro} - ${p.endereco.referencia || ''}\nWhatsApp: ${p.cliente_whatsapp}`;
    navigator.clipboard.writeText(text);
    toast.success("Endereço copiado para o entregador!");
  };

  const handleSaveEdit = () => {
    onSave(p.id, {
      cliente_nome: editData.nome,
      cliente_whatsapp: editData.whatsapp,
      endereco: { ...p.endereco, bairro: editData.bairro }
    });
    setIsEditing(false);
  };

  const handleConfirmSale = () => {
    if (!p.evidencias || p.evidencias.length === 0) {
      toast.error("Obrigatorio anexar evidência antes de confirmar venda!", {
        description: "Anexe o comprovante ou foto do produto preparado.",
        duration: 4000,
      });
      fileInputRef.current?.click();
      return;
    }
    onUpdate(p.id, "vendido");
  };

  const handleMarkDelivered = () => {
    onUpdate(p.id, "entregue");
  };

  const handleReopen = () => {
    onUpdate(p.id, "pendente");
  };

  const handleCancel = () => {
    onUpdate(p.id, "cancelado");
  };

  const sendStatusUpdate = (msg: string) => {
    const text = encodeURIComponent(`Olá ${p.cliente_nome}! ${msg}`);
    window.open(`https://wa.me/${p.cliente_whatsapp}?text=${text}`, '_blank');
  };

  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(p.created_at));

  return (
    <div className="group flex flex-col rounded-[2.5rem] border border-rose-tea/10 bg-white p-6 shadow-soft transition-premium hover:shadow-premium hover:-translate-y-1">
      <div className="mb-5 flex items-start justify-between">
        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] ${cfg.bg} ${cfg.text}`}>
          <cfg.icon className="h-3 w-3" /> {cfg.label}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} 
              className={`p-2 rounded-full transition-premium ${isEditing ? "bg-primary text-white" : "hover:bg-secondary text-muted-foreground hover:text-primary"}`}
              title={isEditing ? "Salvar Alterações" : "Editar Pedido"}
            >
              {isEditing ? <Save className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
            </button>
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">#{p.id.slice(0, 5)}</span>
          </div>
          <span className="text-[9px] font-medium text-muted-foreground/70">{dataFormatada}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4 bg-secondary/10 p-3 rounded-2xl border border-rose-tea/5">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-soft text-primary"><User className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Cliente</p>
            {isEditing ? (
              <input className="w-full bg-transparent text-sm font-bold border-b border-primary/20 outline-none" value={editData.nome} onChange={e => setEditData({...editData, nome: e.target.value})} />
            ) : (
              <p className="text-sm font-bold truncate">{p.cliente_nome}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#25D366]/5 p-3 rounded-2xl border border-[#25D366]/10">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-soft text-[#25D366]"><MessageCircle className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#25D366]/60">WhatsApp</p>
            {isEditing ? (
              <input className="w-full bg-transparent text-sm font-bold border-b border-[#25D366]/20 outline-none" value={editData.whatsapp} onChange={e => setEditData({...editData, whatsapp: e.target.value})} />
            ) : (
              <a href={`https://wa.me/${p.cliente_whatsapp}`} target="_blank" rel="noopener" className="text-sm font-bold hover:underline">{p.cliente_whatsapp}</a>
            )}
          </div>
          {!isEditing && (
            <div className="flex gap-1">
              <button onClick={() => sendStatusUpdate("Seu pedido foi confirmado e já estamos preparando com muito carinho! 🌸")} className="p-2 hover:bg-white rounded-lg transition-colors" title="Confirmar Preparo"><Check className="h-3 w-3 text-emerald-500" /></button>
              <button onClick={() => sendStatusUpdate("Seu presente acabou de sair para entrega! Em breve chegará ao destino. 🚚")} className="p-2 hover:bg-white rounded-lg transition-colors" title="Notificar Entrega"><Truck className="h-3 w-3 text-blue-500" /></button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 bg-rose-deep/5 p-3 rounded-2xl border border-rose-deep/10">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-soft text-rose-deep"><MapPin className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-deep/60">Entrega: {p.tipo_entrega}</p>
            {isEditing && p.tipo_entrega === "entrega" ? (
              <input className="w-full bg-transparent text-xs font-bold border-b border-rose-deep/20 outline-none" value={editData.bairro} onChange={e => setEditData({...editData, bairro: e.target.value})} />
            ) : (
              <p className="text-xs font-bold truncate">{p.tipo_entrega === "retirada" ? "Retirada na Loja" : `${p.endereco?.bairro || '—'}`}</p>
            )}
          </div>
          {p.tipo_entrega !== "retirada" && !isEditing && <button onClick={copyAddress} className="p-2 hover:bg-white rounded-lg transition-colors" title="Copiar Endereço"><Copy className="h-3 w-3 text-rose-deep" /></button>}
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
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Evidências / Fotos</p>
          <button disabled={uploading} onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1">
            {uploading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />} Anexar
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
        </div>
        {p.evidencias && p.evidencias.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {p.evidencias.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener" className="h-10 w-10 rounded-lg border border-rose-tea/20 overflow-hidden bg-secondary flex items-center justify-center hover:border-primary transition-colors"><ImageIcon className="h-4 w-4 text-primary" /></a>
            ))}
          </div>
        ) : <p className="text-[10px] italic text-muted-foreground/40">Nenhuma foto anexada.</p>}
      </div>

      <div className="mt-auto pt-4 border-t border-rose-tea/10">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total</p><p className="text-xl font-bold text-primary">{formatBRL(p.total)}</p></div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Pagamento</p>
            <div className="mt-1 flex items-center justify-end gap-1.5">
              {p.forma_pagamento === "pix" && <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-600 border border-emerald-100">💎 Pix</span>}
              {p.forma_pagamento === "cartao_online" && <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase text-blue-600 border border-blue-100">🔗 Link</span>}
              {p.forma_pagamento === "cartao_entrega" && <span className="flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[9px] font-bold uppercase text-rose-600 border border-rose-100">💳 Maquininha</span>}
              {!p.forma_pagamento && <span className="text-[10px] font-bold uppercase text-muted-foreground">WhatsApp</span>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {p.status === "pendente" && <button onClick={handleConfirmSale} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-soft hover:bg-primary-glow transition-premium">Confirmar Venda</button>}
          {p.status === "vendido" && <button onClick={handleMarkDelivered} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-soft hover:bg-emerald-700 transition-premium"><Truck className="h-4 w-4" /> Marcar como Entregue</button>}
          
          {p.status === "cancelado" ? (
            <button onClick={handleReopen} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-soft hover:bg-amber-600 transition-premium">
              <Undo className="h-4 w-4" /> Reabrir Pedido
            </button>
          ) : p.status !== "entregue" && (
            <button onClick={handleCancel} className="col-span-2 border border-rose-tea/20 text-muted-foreground py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-premium">
              Cancelar Pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
