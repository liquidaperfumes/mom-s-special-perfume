import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useCart } from "@/lib/cart";
import { formatBRL, parcelas } from "@/lib/kits";
import { calcularFrete, FRETE_GRATIS_ACIMA_DE, BAIRROS_DISPONIVEIS } from "@/lib/frete";
import { ArrowLeft, Check, MessageCircle, Store, Truck, CreditCard, Smartphone } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Líquida Perfumes" },
      { name: "description", content: "Finalize sua compra com Pix ou cartão em até 10x." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

type EntregaModo = "entrega" | "retirada";
type Pagamento = "pix" | "cartao";

function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // step 1
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");

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
  const [pagamento, setPagamento] = useState<Pagamento>("pix");

  const fr = modo === "entrega" && bairro ? calcularFrete(bairro) : null;
  const freteValor = useMemo(() => {
    if (modo === "retirada") return 0;
    if (!fr || !fr.disponivel) return null;
    return total >= FRETE_GRATIS_ACIMA_DE ? 0 : fr.valor;
  }, [fr, modo, total]);

  const descontoPix = pagamento === "pix" ? total * 0.05 : 0;
  const totalFinal = total - descontoPix + (freteValor ?? 0);

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

  const finalizar = () => {
    const linhas = items.map((i) => `• ${i.qtd}x ${i.kit.nome} — ${formatBRL(i.kit.preco * i.qtd)}`).join("%0A");
    const enderecoTxt = modo === "retirada"
      ? "Retirada na loja (Estrada do Caenga, 235 - São Benedito, Olinda - PE)"
      : `${rua}, ${num}${comp ? " - " + comp : ""} - ${bairro}, ${cidade}/${uf} - CEP ${cep}`;
    const msg = [
      `*Novo pedido — Líquida Perfumes 💝*`,
      ``,
      `*Cliente:* ${nome}`,
      `*Email:* ${email}`,
      `*Telefone:* ${tel}`,
      ``,
      `*Itens:*`,
      decodeURIComponent(linhas.replace(/%0A/g, "\n")),
      ``,
      `*Entrega:* ${enderecoTxt}`,
      `*Frete:* ${freteValor === 0 ? "Grátis" : freteValor != null ? formatBRL(freteValor) : "A combinar"}`,
      `*Pagamento:* ${pagamento === "pix" ? "Pix (5% de desconto)" : "Cartão"}`,
      ``,
      `*Subtotal:* ${formatBRL(total)}`,
      pagamento === "pix" ? `*Desconto Pix:* -${formatBRL(descontoPix)}` : "",
      `*TOTAL: ${formatBRL(totalFinal)}*`,
    ].filter(Boolean).join("\n");

    const url = `https://wa.me/5581997127309?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setTimeout(() => {
      clear();
      navigate({ to: "/sucesso" });
    }, 600);
  };

  const canNext1 = nome.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && tel.replace(/\D/g, "").length >= 10;
  const canNext2 = modo === "retirada" || (cep.replace(/\D/g, "").length === 8 && rua && num && bairro);

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

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {/* Stepper */}
          <ol className="mb-6 flex items-center gap-2 text-xs font-semibold">
            {["Identificação", "Entrega", "Pagamento"].map((s, i) => (
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="E-mail"><input type="email" className={inp} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" /></Field>
                  <Field label="Telefone / WhatsApp"><input className={inp} value={tel} onChange={(e) => setTel(e.target.value)} placeholder="(81) 9.9999-9999" /></Field>
                </div>
                <button disabled={!canNext1} onClick={() => setStep(2)} className={btnPrimary}>Continuar →</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl">Como você quer receber?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ModoCard active={modo === "entrega"} onClick={() => setModo("entrega")} icon={<Truck className="h-5 w-5" />} title="Entrega no endereço" desc="Receba em casa em 1-5 dias úteis" />
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

                    {fr && !fr.disponivel && (
                      <div className="sm:col-span-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                        <p className="font-semibold">Bairro fora da nossa rota fixa.</p>
                        <p className="mt-1 text-muted-foreground">Você pode escolher retirada na loja ou falar conosco no WhatsApp para combinarmos a entrega.</p>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => setModo("retirada")} className="rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background">Retirar na loja</button>
                          <a href={`https://wa.me/5581997127309?text=${encodeURIComponent("Olá! Meu bairro é " + bairro + " e gostaria de combinar entrega.")}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white"><MessageCircle className="h-3 w-3" /> WhatsApp</a>
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
                <h2 className="font-display text-2xl">Como você prefere pagar?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ModoCard active={pagamento === "pix"} onClick={() => setPagamento("pix")} icon={<Smartphone className="h-5 w-5" />} title="Pix" desc="5% de desconto · aprovação imediata" highlight />
                  <ModoCard active={pagamento === "cartao"} onClick={() => setPagamento("cartao")} icon={<CreditCard className="h-5 w-5" />} title="Cartão de crédito" desc={`Em até ${parcelas(totalFinal).vezes}x sem juros`} />
                </div>

                <div className="rounded-xl bg-secondary p-4 text-xs leading-relaxed text-muted-foreground">
                  Ao finalizar, você será encaminhada para o nosso atendimento no WhatsApp para confirmar o pagamento e garantir seu pedido. Pix e cartão são processados com segurança.
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className={btnGhost}>Voltar</button>
                  <button onClick={finalizar} className={btnPrimary}>Finalizar pedido →</button>
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
              {descontoPix > 0 && <Linha label="Desconto Pix (5%)" v={`-${formatBRL(descontoPix)}`} accent />}
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-sm font-bold uppercase tracking-wider">Total</span>
                <span className="font-display text-2xl text-primary">{formatBRL(totalFinal)}</span>
              </div>
              {pagamento === "cartao" && (
                <p className="text-right text-[11px] text-muted-foreground">ou {parcelas(totalFinal).vezes}x de {formatBRL(parcelas(totalFinal).valor)} sem juros</p>
              )}
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

function ModoCard({ active, onClick, icon, title, desc, highlight }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl border-2 p-4 text-left transition ${
        active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
      }`}
    >
      {highlight && <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">5% off</span>}
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-sm font-bold text-foreground">{title}</span></div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}
