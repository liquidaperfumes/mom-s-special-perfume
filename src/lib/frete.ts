// Tabela de frete por bairro (Recife / Olinda / Jaboatão / regiões metropolitanas).
// Fonte: tabela oficial Líquida Perfumes.
// Valores podem ser número (R$) ou faixa de prazo (string "15/20" = R$15, prazo 20 dias úteis).

type Entry = { valor: number; prazo?: string };

const raw: Record<string, number | string> = {
  "Abreu e Lima": 23, "Aflitos": 15, "Afogados": 15, "Água Fria": 10, "Águas Compridas": 10,
  "Aguazinha": 8, "Aldo da Bondade": 12, "Alto da Conquista": 12, "Alto da Telha": 12,
  "Alto do Mandu": 15, "Alto José Bonifácio": 15, "Alto José do Pinho": 15, "Alto Nova Olinda": 12,
  "Alto Pascoal": 12, "Alto Santa Teresinha": 12, "Alto Sol Nascente": 12, "Amaro Branco": 15,
  "Amparo": 12, "Areias": "15/20", "Arruda": 12, "Bairro Novo": 12, "Barro": 20, "Beberibe": 8,
  "Boa Viagem": 15, "Boa Vista": 15, "Bola na Rede": 15, "Bom Sucesso": 15, "Bomba do Hemetério": 12,
  "Bongi": 15, "Brasília Teimosa": 15, "Brejo da Guabiraba": 15, "Bultrins": 15, "Buriti": 12,
  "Caenga": 8, "Caixa d'Água": 8, "Cajueiro Beberibe": 12, "Cajueiro Seco": "20/25",
  "Camaragibe": "20/25", "Campo Grande": 15, "Candeias": "20/30", "Carmo": 12, "Casa Amarela": 15,
  "Casa Caiada": 15, "Casa Forte": 15, "Cavaleiro": "15/20", "Caxangá": 15,
  "CEASA": "15/20", "Cisam": 15, "Coelhos": 15, "Coqueiral": 20, "Cordeiro": "15/20",
  "Córrego do Jenipapo": 15, "Curado": "20/25", "Derby": 15, "Dois Irmãos": 15, "Dois Unidos": 10,
  "Encruzilhada": 15, "Engenho do Meio": 15, "Engenho Maranguape": 17, "Espinheiro": 15,
  "Estância": 15, "Fragoso": 15, "Fundão": 12, "Hipódromo": 15, "Ibura": "20/25",
  "Igarassu": 30, "Ilha do Leite": 15, "Ilha do Retiro": 15, "Imbiribeira": 15, "Ipsep": 15,
  "Itapissuma": 45, "Jaboatão": "20/25", "Jaguarana (Abreu e Lima)": 20, "Jaguarana (Paulista)": 17,
  "Janga": 17, "Jardim Atlântico": 15, "Jardim Brasil": 12, "Jardim Paulista": 15,
  "Jardim São Paulo": 20, "Jiquiá": 20, "Jordão": 20, "Lagoa Encantada": 20, "Linha do Tiro": 10,
  "Loteamento Conceição": 20, "Macaxeira": 15, "Madalena": 15, "Mangabeira": 15, "Mangueira": 15,
  "Maranguape 2": 17, "Maria Farinha": 25, "Milagres": 12, "Monte": 15, "Monteiro": 12,
  "Morro da Conceição": 15, "Mustardinha": 15, "Nova Cruz": 25, "Nova Descoberta": 12,
  "Ouro Preto": 12, "Paissandu": 12, "Parnamirim": 15, "Passarinho": 12, "Pau Amarelo": 20,
  "Paulista Centro": 15, "Peixinhos": 10, "Piedade": "20/25", "Pina": 15, "Poço da Panela": 15,
  "Ponte d'Uchoa": 15, "Ponto de Parada": 12, "Porto da Madeira": 12, "Prazeres": 20, "Prado": 15,
  "Rio Doce": 15, "Rosarinho": 15, "Salgadinho": 12, "San Martin": 15, "Sancho": 20, "Santana": 12,
  "Santo Amaro": 15, "Santo Antônio": 15, "São José": 15, "Sapucaia": 8, "Sítio dos Pintos": 15,
  "Sítio Novo": 12, "Soledade": 15, "Tamarineira": 15, "Tejipió": 20, "Torre": 15, "Torreão": 15,
  "Totó": 20, "Varadouro": 15, "Várzea": 15, "Vasco da Gama": 12, "Vila Popular": 12,
  "Vila Rica": 25, "Zumbi": "20/25",
};

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const TABELA: Record<string, Entry> = Object.fromEntries(
  Object.entries(raw).map(([nome, v]) => {
    if (typeof v === "number") return [normalize(nome), { valor: v, prazo: "2 a 3 dias úteis" }];
    const [val, prazo] = v.split("/");
    return [normalize(nome), { valor: Number(val), prazo: `${prazo} dias úteis` }];
  })
);

export const BAIRROS_DISPONIVEIS = Object.keys(raw).sort();

export type FreteResult =
  | { disponivel: true; valor: number; prazo: string; bairro: string }
  | { disponivel: false; bairro: string };

export function calcularFrete(bairroInput: string): FreteResult {
  const key = normalize(bairroInput);
  const entry = TABELA[key];
  if (!entry) return { disponivel: false, bairro: bairroInput };
  // procurar nome original
  const original = BAIRROS_DISPONIVEIS.find((b) => normalize(b) === key) ?? bairroInput;
  return { disponivel: true, valor: entry.valor, prazo: entry.prazo!, bairro: original };
}

export const FRETE_GRATIS_ACIMA_DE = 999999; // Desativado conforme solicitado
