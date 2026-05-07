## Visão Geral

Landing page mobile-first, emocional e de alta conversão para a campanha de Dia das Mães da Líquida Perfumes, com catálogo de 16 kits, cálculo de frete por bairro (Recife/Olinda), retirada na loja e checkout online com Stripe (Pix + cartão).

## Identidade Visual

Extraída do manual anexo:
- **Cores**: rosa profundo `#BF355D` (primária/CTAs), rosa chá `#F7ADAF` (acentos), off-white `#FFF8F9` (fundo), grafite `#1A1A1A` (textos).
- **Tipografia**: Montserrat (Bold para títulos, Medium para corpo) — via Google Fonts.
- **Texturas**: padrão de "L" laço repetido como elemento decorativo sutil em seções.
- **Tom**: sofisticado, feminino, emocional ("Transforme carinho em memória").

## Estrutura de Rotas (TanStack Start)

```
src/routes/
  __root.tsx          (header sticky + footer + meta global)
  index.tsx           (landing completa)
  kits.$slug.tsx      (página individual do kit — opcional, com OG image)
  checkout.tsx        (checkout multi-step)
  sucesso.tsx         (pós-pagamento)
  api/
    public/
      stripe-webhook.ts   (confirma pedido)
    create-checkout.ts    (server fn cria sessão Stripe)
    calc-frete.ts         (server fn calcula frete por bairro)
```

## Seções da Landing (index.tsx)

1. **Header sticky** — logo + nav (Kits, Frete, Loja) + carrinho.
2. **Hero** — fundo rosa profundo com textura de laços, headline "Transforme carinho em memória", subheadline sobre os kits, **contagem regressiva até 11/05**, CTAs "Garantir Meu Kit" e "Ver Kits", selos (Original • Frete Rápido • Retirada Hoje).
3. **Barra de urgência** — "Estoque limitado — entregas garantidas até o Dia das Mães se comprar até [data]".
4. **Grid de Kits** (16 cards) — imagem, nome, descrição curta, preço, parcelamento (10x sem juros), badge "Mais Vendido" / "Edição Especial", botão "Comprar". Hover com elevação e zoom suave.
5. **Seção emocional** — storytelling com tipografia serif decorativa em itálico, imagem grande, frases curtas sobre memórias afetivas.
6. **Benefícios** (6 ícones) — Entrega rápida, 100% Original, Embalagem presenteável, Compra segura, Retirada em loja, Pix com 5% off.
7. **Calculadora de Frete** — input de CEP/bairro com autocomplete da tabela. Mostra valor + prazo, ou "Bairro fora da área — retire na loja ou fale no WhatsApp".
8. **Retirada na Loja** — endereço, mapa embed (Google Maps iframe), horário, botão "Como chegar".
9. **Prova social** — 3-4 depoimentos com foto e estrelas.
10. **FAQ** — accordion (entrega, troca, originalidade, prazos).
11. **CTA final** + **Sticky CTA mobile** (botão flutuante "Comprar Agora").
12. **Footer** — contato, redes, CNPJ.

## Catálogo de Kits

Os 16 kits do PDF, com imagens copiadas de `parsed-documents://.../kits.pdf/images/` para `src/assets/kits/`. Marcação de destaque sugerida:
- **Mais Vendido**: Lily Tradicional (R$ 249,99), Floratta Rose (R$ 144,99), Egeo Dolce (R$ 174,99).
- **Edição Especial**: Elysee Tradicional (R$ 289,99), Her Code Tradicional (R$ 244,99).

## Frete

- Tabela completa dos ~150 bairros (imagem anexa) num arquivo `src/lib/frete-table.ts` como `Record<string, { valor: number; prazo: string }>`.
- Bairros com "15/20", "20/25" etc. tratados como faixas de prazo em dias úteis a R$ 15.
- Server function `calcFrete({ bairro })` retorna valor + prazo, ou `{ disponivel: false }`.
- Frete grátis automático para pedidos acima de R$ 250 dentro da área.
- Fora da área: UI mostra dois CTAs — "Retirar na Loja" e "Falar no WhatsApp" (link `wa.me` com mensagem pré-preenchida com itens do carrinho).

## Checkout (Stripe)

Fluxo em 3 passos numa única página, mobile-first, com resumo fixo:
1. **Identificação** — nome, e-mail, telefone (validação Zod).
2. **Entrega** — escolha entre "Entrega" (CEP + endereço com autofill via ViaCEP) ou "Retirar na loja".
3. **Pagamento** — Stripe Checkout Session redirect, com Pix e cartão (até 10x).

Ações backend:
- `createCheckoutSession` (server fn) — cria a session com line_items do carrinho + frete como item separado.
- `/api/public/stripe-webhook` — confirma pedido, marca como pago.

> Requer **enable_stripe_payments** + criação dos 16 produtos no Stripe via `batch_create_product`. Faremos isso após sua aprovação do plano.

## Persistência (Lovable Cloud)

Tabelas:
- `kits` — id, slug, nome, descricao, preco_centavos, imagem_url, badge, ativo.
- `pedidos` — id, cliente, itens (jsonb), frete_valor, total, modo_entrega, endereco (jsonb), status, stripe_session_id.

RLS: leitura pública de kits; pedidos só pelo dono via e-mail/sessão.

## SEO & Performance

- `head()` por rota com title/description/OG específicos.
- OG image = imagem do hero (rosa com kits).
- Imagens dos kits otimizadas (WebP) e lazy-loaded.
- JSON-LD `Product` em cada kit.

## Stack

TanStack Start + Tailwind v4 + shadcn/ui (já instalado) + Lovable Cloud (Supabase) + Stripe (Lovable Payments) + lucide-react para ícones + Framer Motion para microanimações.

## Próximos Passos Após Aprovação

1. Habilitar Lovable Cloud + Stripe Payments.
2. Copiar imagens do PDF para `src/assets/kits/` e logo para `src/assets/`.
3. Criar tabela `kits` e `pedidos` + seed dos 16 kits.
4. Criar produtos no Stripe (batch).
5. Construir rotas, componentes e checkout.
6. QA mobile (375px) e desktop.
