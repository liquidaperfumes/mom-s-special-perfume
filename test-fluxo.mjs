import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uycsoeqqbayjroetmsai.supabase.co';
const supabaseAnonKey = 'sb_publishable_ETTf_ZK_wPZnYck2p9Nkwg_Ua4ugunJ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarPedido() {
  console.log("=== SIMULANDO CHECKOUT (Sem Navegador) ===");
  const nome = "Teste Automático";
  const whatsapp = "11999999999";
  const items = [
    { kit: { nome: "Kit 1 - Essencial", preco: 150 }, qtd: 1 }
  ];
  const modo = "retirada";
  const formaPagamento = "pix";
  const totalFinal = 150;

  console.log("1. Tentando salvar pedido no banco de dados sem a coluna 'forma_pagamento'...");
  
  const { data, error } = await supabase.from("pedidos").insert({
    cliente_nome: nome,
    cliente_whatsapp: whatsapp,
    itens: items,
    tipo_entrega: modo,
    endereco: null,
    total: totalFinal,
    status: "pendente"
  }).select();

  if (error) {
    console.error("ERRO NO BANCO DE DADOS:", error);
    return;
  }
  
  console.log("SUCESSO! Pedido gravado na tabela 'pedidos' com ID:", data[0].id);

  console.log("\n2. Simulando montagem da URL do WhatsApp...");
  const intro = `Olá! Acabei de fazer um pedido pelo site:\n\n`;
  const clienteInfo = `*CLIENTE:* ${nome}\n*WHATSAPP:* ${whatsapp}\n\n`;
  const itensInfo = `*PRODUTOS:* \n• 1x Kit 1 - Essencial - R$ 150,00\n\n`;
  const entregaInfo = `*RETIRADA:* Na loja em Olinda (Estrada do Caenga, 235)\n\n`;
  const totalInfo = `*VALOR TOTAL:* R$ 150,00\n`;
  const pagInfo = `*FORMA DE PAGAMENTO:* Pix\n\n`;
  const footer = `_Por favor, confirme meu pedido e envie o link se necessário!_`;

  const fullMessage = intro + clienteInfo + itensInfo + entregaInfo + totalInfo + pagInfo + footer;
  
  console.log("Mensagem bruta que vai pro WhatsApp:\n" + fullMessage);
  
  const urlEncoded = encodeURIComponent(fullMessage);
  console.log("\n3. Redirecionamento da URL de Sucesso:");
  console.log(`/sucesso?msg=${urlEncoded.substring(0, 40)}...`);

  console.log("\n4. URL final gerada no Botão Verde do WhatsApp na tela de sucesso:");
  console.log(`https://api.whatsapp.com/send?phone=5581995811306&text=${urlEncoded}`);
  
  console.log("\n=== TESTE CONCLUÍDO COM ÊXITO ===");
}

testarPedido();
