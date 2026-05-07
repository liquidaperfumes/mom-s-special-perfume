import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useCart } from "@/lib/cart";
import { formatBRL, parcelas } from "@/lib/kits";
import { calcularFrete, BAIRROS_DISPONIVEIS } from "@/lib/frete";
import { ArrowLeft, Check, MessageCircle, Store, Truck, CreditCard, Smartphone, Clock } from "lucide-react";

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
type FinalizarModo = "online" | "whatsapp";

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
  const [finalizarModo, setFinalizarModo] = useState<FinalizarModo>("online");

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

  const finalizarWhatsApp = () => {
    const msg = buildWhatsAppMessage(
      items, nome, whatsapp, modo,
      { rua, num, comp, bairro, cidade, uf, cep },
      total, freteValor,
    );
    const url = `https://wa.me/${WHATSAPP_CONSULTORA}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setTimeout(() => {
      clear();
      navigate({ to: "/sucesso" });
    }, 600);
  };

  const finalizarOnline = () => {
    // TODO: Integrar com Pagar.me API
    // Por enquanto, direciona ao WhatsApp com detalhes do pagamento online
    const msg = buildWhatsAppMessage(
      items, nome, whatsapp, modo,
      { rua, num, comp, bairro, cidade, uf, cep },
      total, freteValor,
    );
    const msgOnline = msg + "\n\n_💳 Cliente optou por pagamento online (Pagar.me)_";
    const url = `https://wa.me/${WHATSAPP_CONSULTORA}?text=${encodeURIComponent(msgOnline)}`;
    window.open(url, "_blank");
    setTimeout(() => {
      clear();
      navigate({ to: "/sucesso" });
    }, 600);
  };

  const finalizar = () => {
    if (finalizarModo === "whatsapp") {
      finalizarWhatsApp();
    } else {
      finalizarOnline();
    }
  };

  const canNext1 = nome.trim().length > 1 && whatsapp.replace(/\D/g, "").length >= 10;
  const canNext2 = modo === "retirada" || (cep.replace(/\D/g, "").length === 8 && rua && num && bairro);

  const p = parcelas(totalFinal);

  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4" /> Continuar comprando</Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-rose text-primary-foreground">
              <span className="font-display text-lg leading-none">L</span>
            </div>
            <span className="text-xs font-bold tracking-[0.25em]">LIQUIDA</span>
          </div>
        </div>
      </header>

      {/* WhatsApp CTA Banner */}
      <div className="bg-[#25D366] py-2.5 text-center">
        <a
          href={`https://wa.me/${WHATSAPP_CONSULTORA}?text=${encodeURIComponent("Olá! Gostaria de finalizar meu pedido com uma consultora.")}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 text-xs font-bold text-white sm:text-sm"
        >
          <MessageCircle className="h-4 w-4" />
          Prefere finalizar com uma consultora? Envie seu pedido pelo WhatsApp: {WHATSAPP_DISPLAY}
        </a>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {/* Stepper */}
          <ol className="mb-6 flex items-center gap-2 text-xs font-semibold">
            {["Identificação", "Entrega", "Finalização"].map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] ${
                  step > i + 1 ? "bg-primary text-primary-foreground" : step === i + 1 ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                }`}>{step > i + 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
                <span className={step === i + 1 ? "text-foreground" : "text-muted-foreground"}>{s}</span>
                {i < 2 && <span className="ml-1 h-px flex-1 bg-border" />}
              </li>
            ))}
          </ol>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl">Quem está presenteando?</h2>
                <Field label="Nome completo"><input className={inp} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Maria Silva" /></Field>
                <Field label="WhatsApp">
                  <input className={inp} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(81) 9.9999-9999" />
                  <p className="mt-1 text-[11px] text-muted-foreground">Usaremos apenas para contato sobre seu pedido.</p>
                </Field>
                <button disabled={!canNext1} onClick={() => setStep(2)} className={btnPrimary}>Continuar →</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl">Como você quer receber?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ModoCard active={modo === "entrega"} onClick={() => setModo("entrega")} icon={<Truck className="h-5 w-5" />} title="Entrega no endereço" desc="Receba em até 3 horas" highlight>
                    <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-primary"><Clock className="h-3 w-3" /> Entrega expressa</span>
                  </ModoCard>
                  <ModoCard active={modo === "retirada"} onClick={() => setModo("retirada")} icon={<Store className="h-5 w-5" />} title="Retirar na loja" desc="Olinda · Grátis · pronto em 2h" />
                </div>

                {modo === "entrega" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="CEP">
                      <input className={inp} value={cep} onChange={(e) => buscarCep(e.target.value)} placeholder="00000-000" maxLength={9} />
                      {buscandoCep && <p className="mt-1 text-xs text-muted-foreground">Buscando endereço…</p>}
                    </Field>
                    <Field label="Bairro">
                      <input list="bairros" className={inp} value={bairro} onChange={(e) => setBairro(e.target.value)} />
                      <datalist id="bairros">{BAIRROS_DISPONIVEIS.map((b) => <option key={b} value={b} />)}</datalist>
                    </Field>
                    <div className="sm:col-span-2"><Field label="Rua / Logradouro"><input className={inp} value={rua} onChange={(e) => setRua(e.target.value)} /></Field></div>
                    <Field label="Número"><input className={inp} value={num} onChange={(e) => setNum(e.target.value)} /></Field>
                    <Field label="Complemento (opcional)"><input className={inp} value={comp} onChange={(e) => setComp(e.target.value)} /></Field>
                    <Field label="Cidade"><input className={inp} value={cidade} onChange={(e) => setCidade(e.target.value)} /></Field>
                    <Field label="UF"><input className={inp} value={uf} onChange={(e) => setUf(e.target.value)} maxLength={2} /></Field>

                    {modo === "entrega" && (
                      <div className="sm:col-span-2 rounded-xl bg-primary/5 border border-primary/20 p-3 text-sm">
                        <p className="flex items-center gap-2 font-semibold text-primary"><Clock className="h-4 w-4" /> Entrega em até 3 horas</p>
                        <p className="mt-1 text-xs text-muted-foreground">Após a confirmação do pagamento, seu pedido será entregue rapidamente.</p>
                      </div>
                    )}

                    {fr && !fr.disponivel && (
                      <div className="sm:col-span-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                        <p className="font-semibold">Bairro fora da nossa rota fixa.</p>
                        <p className="mt-1 text-muted-foreground">Você pode escolher retirada na loja ou falar com nossa consultora no WhatsApp para combinarmos a entrega.</p>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => setModo("retirada")} className="rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background">Retirar na loja</button>
                          <a href={`https://wa.me/${WHATSAPP_CONSULTORA}?text=${encodeURIComponent("Olá! Meu bairro é " + bairro + " e gostaria de combinar entrega.")}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white"><MessageCircle className="h-3 w-3" /> WhatsApp</a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {modo === "retirada" && (
                  <div className="rounded-xl bg-secondary p-4 text-sm">
                    <p className="font-semibold">📍 Estrada do Caenga, 235</p>
                    <p className="text-muted-foreground">São Benedito · Olinda – PE · Seg–Sáb 9h-19h</p>
                    <p className="mt-2 text-xs text-primary">✓ Pronto para retirada em até 2 horas após a confirmação.</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className={btnGhost}>Voltar</button>
                  <button disabled={!canNext2} onClick={() => setStep(3)} className={btnPrimary}>Continuar →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl">Como você prefere finalizar?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ModoCard active={finalizarModo === "online"} onClick={() => setFinalizarModo("online")} icon={<CreditCard className="h-5 w-5" />} title="Pagamento online" desc="Pix ou cartão em até 12x · Pagar.me">
                    <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground"><Smartphone className="h-3 w-3" /> Aprovação imediata</span>
                  </ModoCard>
                  <ModoCard active={finalizarModo === "whatsapp"} onClick={() => setFinalizarModo("whatsapp")} icon={<MessageCircle className="h-5 w-5" />} title="Finalizar pelo WhatsApp" desc={`Converse com nossa consultora: ${WHATSAPP_DISPLAY}`} highlightBadge="Atendimento VIP" />
                </div>

                {finalizarModo === "online" && (
                  <div className="rounded-xl bg-secondary p-4 text-xs leading-relaxed text-muted-foreground">
                    <p>Ao finalizar, seu pedido será processado com segurança pelo <strong className="text-foreground">Pagar.me</strong>. Aceita Pix, cartão de crédito e débito.</p>
                    <p className="mt-2 font-semibold text-foreground">Parcelamento em até 12x</p>
                  </div>
                )}

                {finalizarModo === "whatsapp" && (
                  <div className="rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 p-4 text-xs leading-relaxed">
                    <p className="font-semibold text-foreground">💬 Finalize com atendimento personalizado</p>
                    <p className="mt-1 text-muted-foreground">Ao clicar, o resumo do seu pedido será enviado automaticamente para nossa consultora no WhatsApp. Ela vai te guiar com o pagamento e confirmar a entrega.</p>
                  </div>
                )}

                {/* WhatsApp CTA inline */}
                {finalizarModo === "online" && (
                  <a
                    href={`https://wa.me/${WHATSAPP_CONSULTORA}?text=${encodeURIComponent("Olá! Gostaria de finalizar meu pedido com uma consultora.")}`}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/5 p-3 text-xs text-muted-foreground transition hover:bg-[#25D366]/10"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0 text-[#25D366]" />
                    <span>Prefere finalizar com uma consultora? <strong className="text-foreground">Envie seu pedido pelo WhatsApp: {WHATSAPP_DISPLAY}</strong></span>
                  </a>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className={btnGhost}>Voltar</button>
                  <button onClick={finalizar} className={btnPrimary}>
                    {finalizarModo === "whatsapp" ? "Enviar pedido pelo WhatsApp →" : "Finalizar pedido →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resumo */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Seu pedido</h3>
            <ul className="mt-4 space-y-3 max-h-72 overflow-auto pr-1">
              {items.map(({ kit, qtd }) => (
                <li key={kit.id} className="flex gap-3">
                  <img src={kit.imagem} alt="" className="h-14 w-14 rounded-lg bg-secondary object-contain" />
                  <div className="flex-1 text-xs">
                    <p className="font-semibold">{kit.nome}</p>
                    <p className="text-muted-foreground">{qtd}x · {formatBRL(kit.preco)}</p>
                  </div>
                  <span className="text-xs font-bold">{formatBRL(kit.preco * qtd)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
              <Linha label="Subtotal" v={formatBRL(total)} />
              <Linha label="Frete" v={freteValor === null ? "—" : freteValor === 0 ? "Grátis" : formatBRL(freteValor)} />
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-sm font-bold uppercase tracking-wider">Total</span>
                <span className="font-display text-2xl text-primary">{formatBRL(totalFinal)}</span>
              </div>
              <p className="text-right text-[11px] text-muted-foreground">
                Parcelamento em até {p.vezes}x de {formatBRL(p.valor)}
              </p>
            </div>

            {/* WhatsApp CTA no resumo */}
            <div className="mt-4 rounded-xl bg-[#25D366]/10 p-3 text-center">
              <a
                href={`https://wa.me/${WHATSAPP_CONSULTORA}?text=${encodeURIComponent("Olá! Gostaria de ajuda para finalizar meu pedido.")}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#25D366] hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Finalizar pelo WhatsApp
              </a>
              <p className="mt-1 text-[10px] text-muted-foreground">{WHATSAPP_DISPLAY}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inp = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary focus:ring-2";
const btnPrimary = "w-full rounded-full bg-primary py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-glow disabled:opacity-50";
const btnGhost = "rounded-full border border-border px-5 py-3.5 text-sm font-semibold";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Linha({ label, v, accent }: { label: string; v: string; accent?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "font-semibold text-primary" : "font-medium"}>{v}</span>
    </div>
  );
}

function ModoCard({ active, onClick, icon, title, desc, highlight, highlightBadge, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; highlight?: boolean; highlightBadge?: string; children?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl border-2 p-4 text-left transition ${
        active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
      }`}
    >
      {highlightBadge && <span className="absolute -top-2 right-3 rounded-full bg-[#25D366] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">{highlightBadge}</span>}
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-sm font-bold text-foreground">{title}</span></div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      {children}
    </button>
  );
}
