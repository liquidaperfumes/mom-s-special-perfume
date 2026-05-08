import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
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

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

function maskCEP(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length > 5) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return d;
}

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

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [modo, setModo] = useState<EntregaModo>("entrega");
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [num, setNum] = useState("");
  const [comp, setComp] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("PE");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [loading, setLoading] = useState(false);

  // BUG FIX: abort controller for CEP fetch to prevent stale updates
  const cepAbort = useRef<AbortController | null>(null);

  const fr = modo === "entrega" && bairro ? calcularFrete(bairro) : null;
  const freteValor = useMemo(() => {
    if (modo === "retirada") return 0;
    if (!fr || !fr.disponivel) return null;
    return fr.valor;
  }, [fr, modo]);

  const totalFinal = Math.round((total + (freteValor ?? 0)) * 100) / 100;

  const buscarCep = async (v: string) => {
    const masked = maskCEP(v);
    setCep(masked);
    const clean = masked.replace(/\D/g, "");
    if (clean.length !== 8) return;

    // Abort any previous in-flight request
    cepAbort.current?.abort();
    cepAbort.current = new AbortController();
    setBuscandoCep(true);

    try {
      const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
        signal: cepAbort.current.signal,
      });
      const d = await r.json();
      if (!d.erro) {
        setRua(d.logradouro || "");
        setBairro(d.bairro || "");
        setCidade(d.localidade || "");
        setUf(d.uf || "PE");
      } else {
        toast.error("CEP não encontrado. Preencha o endereço manualmente.");
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        toast.error("Não foi possível buscar o CEP. Preencha manualmente.");
      }
    } finally {
      setBuscandoCep(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Sua sacola está vazia</h1>
          <Link to="/" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white">Ver kits</Link>
        </div>
      </div>
    );
  }

  const finalizar = async () => {
    setLoading(true);
    const enderecoObj = { rua, num, comp, bairro, cidade, uf, cep };
    const msg = buildWhatsAppMessage(items, nome, whatsapp, modo, enderecoObj, total, freteValor);

    try {
      // Save to Supabase — non-blocking: open WhatsApp regardless
      supabase.from("pedidos").insert({
        cliente_nome: nome,
        cliente_whatsapp: whatsapp.replace(/\D/g, ""),
        itens: items,
        tipo_entrega: modo,
        endereco: enderecoObj,
        total: totalFinal,
        status: "pendente",
      }).then(({ error }) => {
        if (error) console.error("Supabase insert error:", error);
      });

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
  // BUG FIX: canNext2 — if bairro is outside route, user should still proceed (consultora handles it)
  const canNext2 = modo === "retirada" || (cep.replace(/\D/g, "").length === 8 && rua && num && bairro);

  const p = parcelas(totalFinal);

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Voltar</span>
          </Link>
          <div className="h-9 sm:h-11 overflow-hidden flex items-center">
            <img src={logoImg} alt="Liquida Perfumes" className="h-full w-auto object-contain mix-blend-multiply" />
          </div>
          <div className="w-16" /> {/* spacer */}
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:py-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          {/* Stepper */}
          <nav className="flex items-center gap-2">
            {[["1", "Dados"], ["2", "Entrega"], ["3", "Finalizar"]].map(([n, s], i) => (
              <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
                <div className={`flex h-1 w-full rounded-full transition-all ${step >= i + 1 ? "bg-primary" : "bg-border"}`} />
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors ${step >= i + 1 ? "text-primary" : "text-muted-foreground/40"}`}>
                  <span className="sm:hidden">{n}</span>
                  <span className="hidden sm:inline">{s}</span>
                </span>
              </div>
            ))}
          </nav>

          <motion.div layout className="rounded-2xl sm:rounded-[2rem] border border-border bg-card p-5 shadow-soft sm:p-10">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Quem está presenteando?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Precisamos apenas do seu nome e WhatsApp para contato.</p>
                </div>
                <div className="space-y-4">
                  <Field label="Nome completo">
                    <input className={inp} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como podemos te chamar?" autoComplete="name" />
                  </Field>
                  <Field label="WhatsApp">
                    {/* BUG FIX: masked input + inputMode tel for mobile keyboard */}
                    <input
                      className={inp}
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
                      placeholder="(81) 9.9999-9999"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </Field>
                </div>
                <button disabled={!canNext1} onClick={() => setStep(2)} className={btnPrimary}>
                  Continuar para entrega →
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Como você quer receber?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Escolha entre entrega expressa ou retirada gratuita.</p>
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <ModoCard active={modo === "entrega"} onClick={() => setModo("entrega")} icon={<Truck className="h-5 w-5" />} title="Entrega" desc="Até 3h" />
                  <ModoCard active={modo === "retirada"} onClick={() => setModo("retirada")} icon={<Store className="h-5 w-5" />} title="Retirar" desc="Grátis · Olinda" />
                </div>

                {modo === "entrega" && (
                  <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Field label="CEP">
                      <div className="relative">
                        <input
                          className={inp}
                          value={cep}
                          onChange={(e) => buscarCep(e.target.value)}
                          placeholder="00000-000"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          maxLength={9}
                        />
                        {buscandoCep && <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                      </div>
                    </Field>
                    <Field label="Bairro">
                      <input list="bairros-list" className={inp} value={bairro} onChange={(e) => setBairro(e.target.value)} autoComplete="off" />
                      <datalist id="bairros-list">{BAIRROS_DISPONIVEIS.map((b) => <option key={b} value={b} />)}</datalist>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Rua / Logradouro">
                        <input className={inp} value={rua} onChange={(e) => setRua(e.target.value)} autoComplete="street-address" />
                      </Field>
                    </div>
                    <Field label="Número">
                      <input className={inp} value={num} onChange={(e) => setNum(e.target.value)} inputMode="numeric" />
                    </Field>
                    <Field label="Complemento (opcional)">
                      <input className={inp} value={comp} onChange={(e) => setComp(e.target.value)} />
                    </Field>

                    {/* Frete info */}
                    {fr && fr.disponivel && (
                      <div className="sm:col-span-2 rounded-xl bg-primary/5 border border-primary/10 p-3 flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary shrink-0" />
                        <div className="text-xs">
                          <p className="font-bold text-primary">Frete: {formatBRL(fr.valor)} · Até 3h</p>
                          <p className="text-muted-foreground mt-0.5">Após confirmação, o presente chega rapidinho.</p>
                        </div>
                      </div>
                    )}

                    {/* BUG FIX: bairro not found — show warning but don't BLOCK proceed */}
                    {fr && !fr.disponivel && bairro.trim().length > 2 && (
                      <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
                        <p className="font-bold text-amber-800">Bairro fora da rota fixa</p>
                        <p className="mt-1 text-xs text-amber-700">Nossa consultora vai combinar a entrega com você pelo WhatsApp. Você pode continuar normalmente.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => setModo("retirada")} className="rounded-full bg-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-background">
                            Retirar na loja
                          </button>
                          <a
                            href={`https://wa.me/${WHATSAPP_CONSULTORA}?text=${encodeURIComponent("Olá! Meu bairro é " + bairro + " e gostaria de combinar entrega.")}`}
                            target="_blank" rel="noopener"
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
                          >
                            <MessageCircle className="h-3 w-3" /> WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {modo === "retirada" && (
                  <div className="rounded-xl bg-secondary/50 p-5 flex items-start gap-4 animate-in fade-in duration-300">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold">Estrada do Caenga, 235</p>
                      <p className="text-muted-foreground mt-1">São Benedito · Olinda – PE</p>
                      <p className="text-muted-foreground">Seg–Sáb · 9h às 19h · Dom · 9h às 14h</p>
                      <p className="mt-2 text-xs font-bold text-primary uppercase tracking-widest">✓ Disponível hoje</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button disabled={!canNext2} onClick={() => setStep(3)} className={btnPrimary}>
                    Continuar para pagamento →
                  </button>
                  <button onClick={() => setStep(1)} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    ← Voltar
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Finalize seu pedido</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Tudo pronto! Agora é só falar com a gente no WhatsApp.</p>
                </div>

                <div className="mx-auto max-w-sm rounded-2xl bg-primary/5 border border-primary/10 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg tracking-tight">Finalização pelo WhatsApp</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    O resumo será enviado automaticamente. Nossa consultora confirmará pagamento e entrega.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button disabled={loading} onClick={finalizar} className={`${btnPrimary} py-5 text-sm`}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processando...
                      </span>
                    ) : "Finalizar no WhatsApp →"}
                  </button>
                  <button onClick={() => setStep(2)} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    ← Voltar
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Resumo lateral */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl sm:rounded-[2rem] border border-border bg-card p-5 shadow-premium sm:p-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 mb-4">Resumo da Sacola</h3>
            <ul className="space-y-3 max-h-[35vh] overflow-auto pr-1">
              {items.map(({ kit, qtd }) => (
                <li key={kit.id} className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary/50">
                    <img src={kit.imagem} alt="" className="h-full w-full object-contain p-1.5" loading="lazy" />
                  </div>
                  <div className="flex-1 text-xs flex flex-col justify-center min-w-0">
                    <p className="font-bold text-foreground leading-tight truncate">{kit.nome}</p>
                    <p className="text-muted-foreground mt-1">{qtd}x · {formatBRL(kit.preco)}</p>
                  </div>
                  <span className="text-xs font-bold self-center shrink-0">{formatBRL(kit.preco * qtd)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
              <Linha label="Subtotal" v={formatBRL(total)} />
              <Linha
                label="Frete"
                v={freteValor === null ? "A combinar" : freteValor === 0 ? "Grátis" : formatBRL(freteValor)}
                accent={freteValor === 0}
              />
              <div className="mt-4 flex items-baseline justify-between border-t border-border/50 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Total</span>
                <span className="text-3xl font-bold text-primary">{formatBRL(totalFinal)}</span>
              </div>
              <p className="text-right text-[10px] font-bold uppercase tracking-widest" style={{ color: '#BF355D', opacity: 0.6 }}>
                Até {p.vezes}x de {formatBRL(p.valor)}
              </p>
            </div>

            {/* Payment logos */}
            <div className="mt-6 flex items-center justify-center gap-3 opacity-30 grayscale">
              <img src="https://logodownload.org/wp-content/uploads/2020/02/pix-logo-1.png" alt="Pix" className="h-3 object-contain" loading="lazy" />
              <img src="https://logodownload.org/wp-content/uploads/2014/10/visa-logo-1.png" alt="Visa" className="h-2.5 object-contain" loading="lazy" />
              <img src="https://logodownload.org/wp-content/uploads/2014/10/mastercard-logo.png" alt="Master" className="h-4 object-contain" loading="lazy" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inp = "w-full rounded-xl sm:rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none ring-primary/20 focus:ring-4 transition-premium placeholder:text-muted-foreground/40 font-normal";
const btnPrimary = "w-full rounded-full bg-primary py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-premium hover:bg-[#D4456E] hover:scale-[1.02] active:scale-[0.98] shadow-soft disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
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

function ModoCard({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl sm:rounded-[1.5rem] border-2 p-4 text-left transition-premium ${active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/30"}`}
    >
      {active && <div className="absolute top-2 right-2 text-primary"><Check className="h-4 w-4" /></div>}
      <div className={`flex flex-col gap-2 ${active ? "text-primary" : "text-muted-foreground"}`}>
        <div className={`h-9 w-9 flex items-center justify-center rounded-lg ${active ? "bg-primary text-white" : "bg-secondary"}`}>
          {icon}
        </div>
        <div>
          <span className="block text-sm font-bold text-foreground">{title}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
    </button>
  );
}
