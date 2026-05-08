import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useCart } from "@/lib/cart";
import { formatBRL, parcelas } from "@/lib/kits";
import { calcularFrete, BAIRROS_DISPONIVEIS } from "@/lib/frete";
import { ArrowLeft, Check, MessageCircle, Store, Truck, MapPin, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";
import logoImg from "@/assets/logo-liquida.jpg";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Líquida Perfumes" },
      { name: "description", content: "Finalize sua compra online ou pelo WhatsApp. Parcelamento em até 12x." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const WHATSAPP_CONSULTORA = "5581995811306";
const WHATSAPP_DISPLAY = "(81) 99581-1306";

type EntregaModo = "entrega" | "retirada";

function buildWhatsAppMessage(
  items: { kit: { nome: string; preco: number }; qtd: number }[],
  nome: string,
  whatsapp: string,
  modo: EntregaModo,
  endereco: { rua: string; num: string; comp: string; bairro: string; cidade: string; uf: string; cep: string },
  total: number,
  freteValor: number | null,
) {
  const linhas = items.map((i) => `• ${i.qtd}x ${i.kit.nome} — ${formatBRL(i.kit.preco * i.qtd)}`).join("\n");
  const enderecoTxt = modo === "retirada"
    ? "Retirada na loja (Estrada do Caenga, 235 - São Benedito, Olinda - PE)"
    : `${endereco.rua}, ${endereco.num}${endereco.comp ? " - " + endereco.comp : ""} - ${endereco.bairro}, ${endereco.cidade}/${endereco.uf} - CEP ${endereco.cep}`;
  const totalFinal = total + (freteValor ?? 0);
  const msg = [
    `*Novo pedido — Líquida Perfumes 💝*`,
    ``,
    `*Cliente:* ${nome}`,
    `*WhatsApp:* ${whatsapp}`,
    ``,
    `*Itens:*`,
    linhas,
    ``,
    `*Entrega:* ${enderecoTxt}`,
    modo === "entrega" ? `*Prazo:* Entrega em até 3 horas` : "",
    `*Frete:* ${freteValor === 0 ? "Grátis" : freteValor != null ? formatBRL(freteValor) : "A combinar"}`,
    ``,
    `*Subtotal:* ${formatBRL(total)}`,
    `*TOTAL: ${formatBRL(totalFinal)}*`,
    ``,
    `Parcelamento em até 12x`,
    ``,
    `Ainda está disponível?`,
  ].filter(Boolean).join("\n");
  return msg;
}

function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // step 1
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // step 2
  const [modo, setModo] = useState<EntregaModo>("entrega");
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [num, setNum] = useState("");
  const [comp, setComp] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("PE");
  const [buscandoCep, setBuscandoCep] = useState(false);

  // step 3
  const [loading, setLoading] = useState(false);

  const fr = modo === "entrega" && bairro ? calcularFrete(bairro) : null;
  const freteValor = useMemo(() => {
    if (modo === "retirada") return 0;
    if (!fr || !fr.disponivel) return null;
    return fr.valor;
  }, [fr, modo]);

  const totalFinal = total + (freteValor ?? 0);

  const buscarCep = async (v: string) => {
    setCep(v);
    const clean = v.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setBuscandoCep(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const d = await r.json();
      if (!d.erro) {
        setRua(d.logradouro || "");
        setBairro(d.bairro || "");
        setCidade(d.localidade || "");
        setUf(d.uf || "PE");
      }
    } catch {} finally { setBuscandoCep(false); }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl">Sua sacola está vazia</h1>
          <Link to="/" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Ver kits</Link>
        </div>
      </div>
    );
  }

  const finalizar = async () => {
    setLoading(true);
    try {
      const enderecoObj = { rua, num, comp, bairro, cidade, uf, cep };
      const msg = buildWhatsAppMessage(
        items, nome, whatsapp, modo,
        enderecoObj,
        total, freteValor,
      );

      // Save to Supabase
      const { error } = await supabase.from("pedidos").insert({
        cliente_nome: nome,
        cliente_whatsapp: whatsapp,
        itens: items,
        tipo_entrega: modo,
        endereco: enderecoObj,
        total: totalFinal,
        status: "pendente",
      });

      if (error) {
        console.error("Erro ao salvar pedido:", error);
        toast.error("Houve um erro ao processar seu pedido. Tente novamente.");
        setLoading(false);
        return;
      }

      const url = `https://wa.me/${WHATSAPP_CONSULTORA}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
      
      clear();
      navigate({ to: "/sucesso" });
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const canNext1 = nome.trim().length > 1 && whatsapp.replace(/\D/g, "").length >= 10;
  const canNext2 = modo === "retirada" || (cep.replace(/\D/g, "").length === 8 && rua && num && bairro);

  const p = parcelas(totalFinal);

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
          <div className="h-8 sm:h-10 overflow-hidden">
            <img src={logoImg} alt="Liquida Perfumes" className="h-full w-auto object-contain" />
          </div>
        </div>
      </header>


      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-8">
          {/* Stepper */}
          <nav className="flex items-center justify-between gap-4 max-w-md mx-auto sm:mx-0">
            {["Identificação", "Entrega", "Finalização"].map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center gap-2 group">
                <div className={`flex h-1 w-full rounded-full transition-premium ${
                  step >= i + 1 ? "bg-primary" : "bg-border"
                }`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  step >= i + 1 ? "text-primary" : "text-muted-foreground/50"
                }`}>{s}</span>
              </div>
            ))}
          </nav>

          <motion.div 
            layout
            className="rounded-[2rem] border border-border bg-card p-6 shadow-soft sm:p-10"
          >
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="font-display text-3xl">Quem está presenteando?</h2>
                  <p className="text-sm text-muted-foreground font-light">Precisamos apenas do seu nome e WhatsApp para contato.</p>
                </div>
                
                <div className="space-y-4">
                  <Field label="Nome completo"><input className={inp} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como podemos te chamar?" /></Field>
                  <Field label="WhatsApp">
                    <input className={inp} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(81) 9.9999-9999" />
                  </Field>
                </div>
                
                <button disabled={!canNext1} onClick={() => setStep(2)} className={btnPrimary}>Continuar para entrega →</button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="space-y-1">
                  <h2 className="font-display text-3xl">Como você quer receber?</h2>
                  <p className="text-sm text-muted-foreground font-light">Escolha entre entrega expressa ou retirada gratuita.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ModoCard active={modo === "entrega"} onClick={() => setModo("entrega")} icon={<Truck className="h-5 w-5" />} title="Entrega expressa" desc="Em até 3 horas" highlight>
                    <span className="mt-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-primary"><Clock className="h-3 w-3" /> Receba hoje</span>
                  </ModoCard>
                  <ModoCard active={modo === "retirada"} onClick={() => setModo("retirada")} icon={<Store className="h-5 w-5" />} title="Retirar na loja" desc="Grátis · Olinda" />
                </div>

                {modo === "entrega" && (
                  <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-500">
                    <Field label="CEP">
                      <div className="relative">
                        <input className={inp} value={cep} onChange={(e) => buscarCep(e.target.value)} placeholder="00000-000" maxLength={9} />
                        {buscandoCep && <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                      </div>
                    </Field>
                    <Field label="Bairro">
                      <input list="bairros" className={inp} value={bairro} onChange={(e) => setBairro(e.target.value)} />
                      <datalist id="bairros">{BAIRROS_DISPONIVEIS.map((b) => <option key={b} value={b} />)}</datalist>
                    </Field>
                    <div className="sm:col-span-2"><Field label="Rua / Logradouro"><input className={inp} value={rua} onChange={(e) => setRua(e.target.value)} /></Field></div>
                    <Field label="Número"><input className={inp} value={num} onChange={(e) => setNum(e.target.value)} /></Field>
                    <Field label="Complemento (opcional)"><input className={inp} value={comp} onChange={(e) => setComp(e.target.value)} /></Field>
                    
                    <div className="sm:col-span-2 rounded-2xl bg-primary/5 border border-primary/10 p-4 flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold uppercase tracking-widest text-primary mb-0.5">Entrega em até 3 horas</p>
                        <p className="text-muted-foreground font-light">Após a confirmação, seu presente chega rapidinho.</p>
                      </div>
                    </div>

                    {fr && !fr.disponivel && (
                      <div className="sm:col-span-2 rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
                        <p className="font-bold text-sm">Bairro fora da nossa rota fixa.</p>
                        <p className="mt-1 text-xs text-muted-foreground font-light">Fale com nossa consultora para combinarmos a entrega especial ou escolha retirada.</p>
                        <div className="mt-4 flex gap-2">
                          <button onClick={() => setModo("retirada")} className="rounded-full bg-foreground px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-background">Retirar na loja</button>
                          <a href={`https://wa.me/${WHATSAPP_CONSULTORA}?text=${encodeURIComponent("Olá! Meu bairro é " + bairro + " e gostaria de combinar entrega.")}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white"><MessageCircle className="h-3 w-3" /> WhatsApp</a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {modo === "retirada" && (
                  <div className="rounded-2xl bg-secondary/50 p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <MapPin className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div className="text-sm">
                      <p className="font-bold">📍 Estrada do Caenga, 235</p>
                      <p className="text-muted-foreground font-light mt-1">São Benedito · Olinda – PE · Seg–Sáb 9h-19h</p>
                      <p className="mt-3 text-xs font-bold text-primary uppercase tracking-widest">✓ Disponível hoje para você</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button disabled={!canNext2} onClick={() => setStep(3)} className={btnPrimary}>Continuar para pagamento →</button>
                  <button onClick={() => setStep(1)} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">← Voltar para identificação</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-center">
                <div className="space-y-2">
                  <h2 className="font-display text-4xl">Finalize seu pedido</h2>
                  <p className="text-sm text-muted-foreground font-light">Tudo pronto! Agora é só falar com a gente no WhatsApp.</p>
                </div>
                
                <div className="mx-auto max-w-sm rounded-[2.5rem] bg-primary/5 border border-primary/10 p-8 shadow-soft relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-premium" />
                  <div className="relative z-10">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft group-hover:scale-110 transition-premium">
                      <MessageCircle className="h-10 w-10" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 tracking-tight">Finalização Garantida</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-light">
                      O resumo do seu pedido será enviado automaticamente. Nossa consultora te guiará no pagamento e confirmará a entrega.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button disabled={loading} onClick={finalizar} className={`${btnPrimary} py-5 text-base`}>
                    {loading ? "Processando..." : "Finalizar pedido no WhatsApp →"}
                  </button>
                  <button onClick={() => setStep(2)} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">← Voltar para entrega</button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Resumo */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-premium sm:p-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 mb-6">Resumo da Sacola</h3>
            <ul className="space-y-4 max-h-[40vh] overflow-auto pr-2 scrollbar-hide">
              {items.map(({ kit, qtd }) => (
                <li key={kit.id} className="flex gap-4 group">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary/50">
                    <img src={kit.imagem} alt="" className="h-full w-full object-contain p-2 group-hover:scale-110 transition-premium" />
                  </div>
                  <div className="flex-1 text-xs flex flex-col justify-center">
                    <p className="font-bold text-foreground leading-tight">{kit.nome}</p>
                    <p className="text-muted-foreground mt-1 font-light">{qtd}x · {formatBRL(kit.preco)}</p>
                  </div>
                  <span className="text-xs font-bold self-center">{formatBRL(kit.preco * qtd)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-3 border-t border-border pt-6 text-sm">
              <Linha label="Subtotal" v={formatBRL(total)} />
              <Linha label="Frete" v={freteValor === null ? "—" : freteValor === 0 ? "Grátis" : formatBRL(freteValor)} accent={freteValor === 0} />
              
              <div className="mt-6 flex items-baseline justify-between border-t border-border/50 pt-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Total do Pedido</span>
                <span className="font-display text-4xl text-primary">{formatBRL(totalFinal)}</span>
              </div>
              <p className="text-right text-[10px] font-bold uppercase tracking-widest text-rose-deep/60 mt-1">
                Até {p.vezes}x de {formatBRL(p.valor)}
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3 grayscale opacity-40">
              <img src="https://logodownload.org/wp-content/uploads/2020/02/pix-logo-1.png" alt="Pix" className="h-3 object-contain" />
              <img src="https://logodownload.org/wp-content/uploads/2014/10/visa-logo-1.png" alt="Visa" className="h-2.5 object-contain" />
              <img src="https://logodownload.org/wp-content/uploads/2014/10/mastercard-logo.png" alt="Master" className="h-4 object-contain" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inp = "w-full rounded-2xl border border-border bg-background px-4 py-4 text-sm outline-none ring-primary/20 focus:ring-4 transition-premium placeholder:text-muted-foreground/30 font-light";
const btnPrimary = "w-full rounded-full bg-primary py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-premium hover:bg-primary-glow hover:scale-[1.02] active:scale-[0.98] shadow-soft disabled:opacity-50 disabled:scale-100";
const btnGhost = "rounded-full border border-border px-6 py-4 text-xs font-bold uppercase tracking-widest transition-premium hover:bg-secondary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">{label}</span>
      {children}
    </label>
  );
}

function Linha({ label, v, accent }: { label: string; v: string; accent?: boolean }) {
  return (
    <div className="flex justify-between text-[11px] font-medium uppercase tracking-widest">
      <span className="text-muted-foreground/60">{label}</span>
      <span className={accent ? "text-emerald-500 font-bold" : "text-foreground"}>{v}</span>
    </div>
  );
}

function ModoCard({ active, onClick, icon, title, desc, highlight, highlightBadge, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; highlight?: boolean; highlightBadge?: string; children?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-[1.5rem] border-2 p-5 text-left transition-premium overflow-hidden group ${
        active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/30"
      }`}
    >
      {active && <div className="absolute top-0 right-0 p-2 text-primary animate-in zoom-in duration-300"><Check className="h-4 w-4" /></div>}
      <div className={`flex items-center gap-3 ${active ? "text-primary" : "text-muted-foreground"}`}>
        <div className={`h-10 w-10 flex items-center justify-center rounded-xl transition-premium ${active ? "bg-primary text-white" : "bg-secondary group-hover:bg-primary/10 group-hover:text-primary"}`}>
          {icon}
        </div>
        <div>
          <span className="block text-sm font-bold text-foreground">{title}</span>
          <p className="text-[11px] text-muted-foreground font-light leading-tight mt-0.5">{desc}</p>
        </div>
      </div>
      {children}
    </button>
  );
}
