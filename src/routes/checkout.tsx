import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  ArrowLeft, ShoppingBag, Truck, Store, MapPin, 
  MessageCircle, ShieldCheck, AlertCircle, Check,
  ChevronRight, CreditCard, Wallet
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/kits";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { calcularFrete } from "@/lib/frete";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [modo, setModo] = useState<"entrega" | "retirada">("entrega");
  const [formaPagamento, setFormaPagamento] = useState<"pix" | "cartao_online" | "cartao_entrega">("pix");
  
  // Form fields
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [referencia, setReferencia] = useState("");
  const [valorEntrega, setValorEntrega] = useState(0);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCep(value);

    if (value.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setRua(data.logradouro);
          setBairro(data.bairro);
          const valor = calcularFrete(data.bairro);
          setValorEntrega(valor);
          toast.success(`Endereço encontrado! Frete: ${formatBRL(valor)}`);
        } else {
          toast.error("CEP não encontrado.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const totalFinal = modo === "entrega" ? total + valorEntrega : total;

  useEffect(() => {
    if (items.length === 0 && step === 1) {
      navigate({ to: "/" });
    }
  }, [items, step, navigate]);

  const handleFinalize = async () => {
    if (!nome || !whatsapp) {
      toast.error("Por favor, preencha nome e whatsapp.");
      return;
    }

    if (modo === "entrega" && (!bairro || !rua || !numero)) {
      toast.error("Por favor, preencha o endereço completo.");
      return;
    }

    const toastId = toast.loading("Finalizando seu pedido...");

    // 1. PRE-COMPUTE URL
    const enderecoObj = modo === "entrega" ? { cep, bairro, rua, numero, referencia } : null;
    const whatsappLimpo = whatsapp.replace(/\D/g, "");
    
    const paymentLabels = {
      pix: "Pix",
      cartao_online: "Link de Pagamento (Cartão)",
      cartao_entrega: "Cartão na Entrega/Retirada"
    };

    const intro = `Olá! Acabei de fazer um pedido pelo site:\n\n`;
    const clienteInfo = `*CLIENTE:* ${nome}\n*WHATSAPP:* ${whatsapp}\n\n`;
    const itensInfo = `*PRODUTOS:* \n${items.map(i => `• ${i.qtd}x ${i.kit.nome} - ${formatBRL(i.kit.preco * i.qtd)}`).join("\n")}\n\n`;
    const entregaInfo = modo === "entrega" 
      ? `*ENTREGA EM:* ${rua}, ${numero}\n*BAIRRO:* ${bairro}\n*CEP:* ${cep}${referencia ? `\n*REF:* ${referencia}` : ""}\n\n`
      : `*RETIRADA:* Na loja em Olinda (Estrada do Caenga, 235)\n\n`;
    const totalInfo = `*VALOR TOTAL:* ${formatBRL(totalFinal)}\n`;
    const pagInfo = `*FORMA DE PAGAMENTO:* ${paymentLabels[formaPagamento]}\n\n`;
    const footer = `_Por favor, confirme meu pedido e envie o link se necessário!_`;

    const fullMessage = intro + clienteInfo + itensInfo + entregaInfo + totalInfo + pagInfo + footer;
    const waUrl = `https://api.whatsapp.com/send?phone=5581995811306&text=${encodeURIComponent(fullMessage)}`;
    const errorWaUrl = `https://api.whatsapp.com/send?phone=5581995811306&text=Olá, tentei fazer um pedido pelo site mas houve um erro técnico. Gostaria de finalizar por aqui!`;

    // 2. OPEN BLANK WINDOW SYNCHRONOUSLY
    // This is the ONLY 100% reliable way to bypass popup blockers when you have an async DB call.
    // The browser sees this as a direct result of the user's click.
    const waWindow = window.open('about:blank', '_blank');

    try {
      // 3. AWAIT DATABASE SAVING safely
      const { error } = await supabase.from("pedidos").insert({
        cliente_nome: nome,
        cliente_whatsapp: whatsappLimpo,
        itens: items,
        tipo_entrega: modo,
        endereco: enderecoObj,
        total: totalFinal,
        status: "pendente",
        forma_pagamento: formaPagamento,
      });

      if (error) console.error("Database insert error:", error);

      toast.success("Pedido realizado com sucesso!", { id: toastId });
      
      // 4. SET URL OF THE OPENED WINDOW
      if (waWindow) {
        waWindow.location.href = waUrl;
      } else {
        // Fallback if popup blocker still somehow killed it
        window.location.href = waUrl;
      }

      // Clear cart and redirect current page
      clear();
      navigate({ to: "/sucesso" });

    } catch (err) {
      console.error("Critical error in finalize:", err);
      
      if (waWindow) {
        waWindow.location.href = errorWaUrl;
      } else {
        window.location.href = errorWaUrl;
      }
      
      toast.error("Houve um pequeno problema, mas você foi redirecionado.", { id: toastId });
      navigate({ to: "/sucesso" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBFB]">
      <header className="border-b border-rose-tea/10 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Checkout Seguro</p>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr]">
          <div className="space-y-6">
            {/* Step 1: Info */}
            <section className="rounded-[2rem] border border-rose-tea/10 bg-white p-6 shadow-premium sm:p-10">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-black text-sm">1</div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Seus Dados</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Identificação e Contato</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    placeholder="Como devemos te chamar?" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded-2xl border border-rose-tea/10 bg-secondary/10 px-5 py-4 text-sm outline-none ring-primary/20 transition-all focus:ring-2" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp</label>
                  <input 
                    type="tel" 
                    placeholder="(81) 9.0000-0000" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full rounded-2xl border border-rose-tea/10 bg-secondary/10 px-5 py-4 text-sm outline-none ring-primary/20 transition-all focus:ring-2" 
                  />
                </div>
              </div>

              <div className="mt-10 mb-8 border-t border-rose-tea/5 pt-10 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-black text-sm">2</div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Entrega ou Retirada?</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Como deseja receber seus presentes?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setModo("entrega")}
                  className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-premium ${modo === "entrega" ? "border-primary bg-primary/5 shadow-soft" : "border-rose-tea/5 bg-secondary/10 grayscale hover:grayscale-0"}`}
                >
                  <Truck className={`h-6 w-6 ${modo === "entrega" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${modo === "entrega" ? "text-primary" : "text-muted-foreground"}`}>Entrega em Casa</span>
                </button>
                <button 
                  onClick={() => setModo("retirada")}
                  className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-premium ${modo === "retirada" ? "border-primary bg-primary/5 shadow-soft" : "border-rose-tea/5 bg-secondary/10 grayscale hover:grayscale-0"}`}
                >
                  <Store className={`h-6 w-6 ${modo === "retirada" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${modo === "retirada" ? "text-primary" : "text-muted-foreground"}`}>Retirada na Loja</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {modo === "entrega" ? (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 space-y-4 overflow-hidden"
                  >
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3 mb-4">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                        Realizamos entregas em toda a região. O valor da entrega é calculado automaticamente com base no seu bairro.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">CEP</label>
                        <input 
                          type="tel" 
                          placeholder="00000-000" 
                          maxLength={8}
                          value={cep} 
                          onChange={handleCepChange} 
                          className="w-full rounded-2xl border border-rose-tea/10 bg-secondary/10 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bairro</label>
                        <input type="text" placeholder="Ex: São Benedito" value={bairro} onChange={e => setBairro(e.target.value)} className="w-full rounded-2xl border border-rose-tea/10 bg-secondary/10 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rua / Logradouro</label>
                        <input type="text" placeholder="Nome da sua rua" value={rua} onChange={e => setRua(e.target.value)} className="w-full rounded-2xl border border-rose-tea/10 bg-secondary/10 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Número</label>
                        <input type="text" placeholder="123" value={numero} onChange={e => setNumero(e.target.value)} className="w-full rounded-2xl border border-rose-tea/10 bg-secondary/10 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Referência</label>
                        <input type="text" placeholder="Perto de onde?" value={referencia} onChange={e => setReferencia(e.target.value)} className="w-full rounded-2xl border border-rose-tea/10 bg-secondary/10 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-100 p-5 overflow-hidden"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-emerald-600 shadow-soft"><MapPin className="h-5 w-5" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Retirada Grátis em Olinda</p>
                        <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                          Estrada do Caenga, 235 — São Benedito, Olinda - PE.<br />
                          <span className="font-bold">Pronto para retirar hoje mesmo!</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagamento Step */}
              <div className="mt-10 mb-8 border-t border-rose-tea/5 pt-10 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-black text-sm">3</div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Como deseja pagar?</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Escolha sua forma preferida</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <PaymentOption 
                  active={formaPagamento === "pix"} 
                  onClick={() => setFormaPagamento("pix")}
                  icon={<Wallet className="h-5 w-5" />}
                  label="Pix"
                  sub="Instantâneo"
                />
                <PaymentOption 
                  active={formaPagamento === "cartao_online"} 
                  onClick={() => setFormaPagamento("cartao_online")}
                  icon={<CreditCard className="h-5 w-5" />}
                  label="Link de Pagamento"
                  sub="Até 12x no cartão"
                />
                <PaymentOption 
                  active={formaPagamento === "cartao_entrega"} 
                  onClick={() => setFormaPagamento("cartao_entrega")}
                  icon={<CreditCard className="h-5 w-5" />}
                  label="Cartão na Entrega"
                  sub="Maquininha"
                />
              </div>

              <div className="mt-10 pt-8 border-t border-rose-tea/10">
                <button 
                  onClick={handleFinalize}
                  className="w-full flex items-center justify-center gap-3 rounded-full bg-primary py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-soft transition-premium hover:scale-[1.02] active:scale-[0.98] hover:bg-primary-glow"
                >
                  <MessageCircle className="h-5 w-5" />
                  Finalizar via WhatsApp
                </button>
                <p className="mt-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                  Seu pedido será enviado diretamente para uma consultora.
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-[2rem] border border-rose-tea/10 bg-white p-6 shadow-premium sm:p-8">
              <h3 className="text-lg font-bold text-foreground mb-6">Resumo da Sacola</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {items.map((it, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-secondary/20">
                      <img src={it.kit.imagem} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground line-clamp-1">{it.kit.nome}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{it.qtd}x {formatBRL(it.kit.preco)}</p>
                      <p className="text-xs font-black text-primary mt-1">{formatBRL(it.kit.preco * it.qtd)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3 border-t border-rose-tea/10 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-bold">{formatBRL(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Entrega</span>
                  <span className={modo === "retirada" ? "text-emerald-500 font-bold" : "font-bold"}>
                    {modo === "retirada" ? "Grátis" : formatBRL(valorEntrega)}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t border-rose-tea/5">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary leading-none block">{formatBRL(totalFinal)}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-1 block">em até 12x no cartão</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">Aviso Importante</span>
                </div>
                <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                  Para sua segurança, todos os pagamentos são realizados apenas no momento da <strong>entrega</strong> ou <strong>retirada</strong> do seu produto.
                </p>
              </div>

              <div className="mt-8 flex flex-col items-center gap-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 text-center">Pagamento Seguro na Entrega</p>
                <div className="flex items-center justify-center gap-5 opacity-80">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4 fill-emerald-600" viewBox="0 0 24 24"><path d="M12 2L2 12l10 10 10-10L12 2zm0 2.83L19.17 12 12 19.17 4.83 12 12 4.83zM12 8l-4 4 4 4 4-4-4-4z"/></svg>
                    <span className="text-[8px] font-black uppercase text-foreground/50">Pix</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-6 rounded-sm bg-blue-600" />
                    <span className="text-[8px] font-black uppercase text-foreground/50">Visa</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1.5">
                      <div className="h-4 w-4 rounded-full bg-red-500 opacity-60" />
                      <div className="h-4 w-4 rounded-full bg-orange-500 opacity-60" />
                    </div>
                    <span className="text-[8px] font-black uppercase text-foreground/50">Master</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function PaymentOption({ active, onClick, icon, label, sub }: { active: boolean, onClick: () => void, icon: any, label: string, sub: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-premium ${active ? "border-primary bg-primary/5 shadow-soft" : "border-rose-tea/5 bg-secondary/10 grayscale hover:grayscale-0"}`}
    >
      <div className={`h-8 w-8 flex items-center justify-center rounded-full ${active ? "bg-primary text-white" : "bg-white text-muted-foreground shadow-soft"}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className={`text-[10px] font-black uppercase tracking-widest ${active ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
        <span className="text-[8px] font-medium text-muted-foreground/60">{sub}</span>
      </div>
    </button>
  );
}
