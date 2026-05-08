import lily from "@/assets/kits/lily-tradicional.jpg";
import glamour from "@/assets/kits/glamour-secrets-black.jpg";
import elysee from "@/assets/kits/elysee-tradicional.jpg";
import coffee from "@/assets/kits/coffee-woman-duo.jpg";
import florattaRose from "@/assets/kits/floratta-rose.jpg";
import lilyCuidados from "@/assets/kits/lily-cuidados.jpg";
import ameixa from "@/assets/kits/ameixa-tradicional.jpg";
import liz from "@/assets/kits/liz-tradicional.jpg";
import egeoDolce from "@/assets/kits/egeo-dolce.jpg";
import herCode from "@/assets/kits/her-code-tradicional.jpg";
import celebre from "@/assets/kits/celebre-sua-forca.jpg";
import deleite from "@/assets/kits/deleite.jpg";
import egeoChoc from "@/assets/kits/egeo-choc.jpg";
import herCodeBody from "@/assets/kits/her-code-body-splash.jpg";
import florattaRed from "@/assets/kits/floratta-red.jpg";
import pessegura from "@/assets/kits/cuide-se-bem-pessegura.jpg";

// As imagens agora são puxadas diretamente do banco de dados (bucket evidencias/produtos)
// O painel Admin tem uma nova aba para fazer o upload dessas fotos.
const imgUrl = (id: string) => `https://uycsoeqqbayjroetmsai.supabase.co/storage/v1/object/public/evidencias/produtos/${id}.jpg?t=${Date.now()}`;

const rosaAbsoluta = imgUrl("e01");
const kissmeDelicious = imgUrl("e02");
const eudoraInstance = imgUrl("e03");
const divaFabulosa = imgUrl("e04");
const laVictorie = imgUrl("e05");
const eudoraRoxo = imgUrl("e06");


// Version: 2026.05.08.01.54 - Force Sync
export type Badge = "Mais Vendido" | "Edição Especial" | "Novidade" | "Mega Promoção" | null;

export type Kit = {
  id: string;
  slug: string;
  nome: string;
  marca: string;
  descricao: string;
  preco: number;
  precoOriginal?: number;
  imagem: string;
  badge: Badge;
};

export const KITS: Kit[] = [
  { id: "k01", slug: "lily-tradicional", nome: "Kit Lily Tradicional", marca: "O Boticário", descricao: "Eau de Parfum + creme hidratante. Sofisticado, floral e atemporal.", preco: 269.99, precoOriginal: 319.99, imagem: lily, badge: "Mais Vendido" },
  { id: "k02", slug: "elysee-tradicional", nome: "Kit Elysée Tradicional", marca: "O Boticário", descricao: "Floral oriental envolvente, presente de alto valor afetivo.", preco: 289.99, precoOriginal: 359.99, imagem: elysee, badge: "Edição Especial" },
  { id: "k03", slug: "her-code-tradicional", nome: "Kit Her Code Tradicional", marca: "O Boticário", descricao: "Frasco icônico em cadeado, fragrância marcante e moderna.", preco: 244.99, precoOriginal: 299.99, imagem: herCode, badge: "Edição Especial" },
  { id: "k04", slug: "coffee-woman-duo", nome: "Kit Coffee Woman Duo", marca: "O Boticário", descricao: "Loção corporal + creme para mãos. Aroma quente e adocicado.", preco: 219.99, precoOriginal: 269.99, imagem: coffee, badge: null },
  { id: "k05", slug: "floratta-red", nome: "Kit Floratta Red", marca: "O Boticário", descricao: "Perfume + loção + sabonete líquido floral envolvente.", preco: 184.99, precoOriginal: 229.99, imagem: florattaRed, badge: "Mega Promoção" },
  { id: "k06", slug: "liz-tradicional", nome: "Kit Liz Tradicional", marca: "O Boticário", descricao: "Perfume, hidratante e necessaire — feito para presentear.", preco: 179.99, precoOriginal: 219.99, imagem: liz, badge: null },
  { id: "k07", slug: "egeo-dolce", nome: "Kit Egeo Dolce", marca: "O Boticário", descricao: "Doce, jovem e brincalhão. Para mães cheias de leveza.", preco: 174.99, precoOriginal: 209.99, imagem: egeoDolce, badge: "Mais Vendido" },
  { id: "k08", slug: "glamour-secrets-black", nome: "Kit Glamour Secrets Black", marca: "O Boticário", descricao: "Perfume sensual e creme aveludado em embalagem premium.", preco: 149.99, precoOriginal: 189.99, imagem: glamour, badge: null },
  { id: "k09", slug: "lily-cuidados", nome: "Kit Lily Cuidados", marca: "O Boticário", descricao: "Linha de cuidados Lily com hidratação e perfume marcante.", preco: 144.99, precoOriginal: 179.99, imagem: lilyCuidados, badge: null },
  { id: "k10", slug: "floratta-rose", nome: "Kit Floratta Rose", marca: "O Boticário", descricao: "Romântico e delicado, com perfume e creme hidratante.", preco: 144.99, precoOriginal: 174.99, imagem: florattaRose, badge: "Mais Vendido" },
  { id: "k11", slug: "egeo-choc", nome: "Kit Egeo Choc", marca: "O Boticário", descricao: "O clássico do chocolate, em uma combinação irresistível.", preco: 134.99, precoOriginal: 169.99, imagem: egeoChoc, badge: "Mega Promoção" },
  { id: "k12", slug: "her-code-body-splash", nome: "Kit Her Code Body Splash", marca: "O Boticário", descricao: "Body splash refrescante em dupla para o dia a dia.", preco: 129.99, precoOriginal: 159.99, imagem: herCodeBody, badge: null },
  { id: "k13", slug: "ameixa-tradicional", nome: "Kit Ameixa Tradicional Nativa SPA", marca: "Nativa SPA", descricao: "Sabonete + loção corporal com fragrância clássica de ameixa.", preco: 99.99, precoOriginal: 129.99, imagem: ameixa, badge: null },
  { id: "k14", slug: "celebre-sua-forca", nome: "Kit Celebre Sua Força", marca: "O Boticário", descricao: "Perfume + creme para mãos. Mensagem que transborda carinho.", preco: 99.99, precoOriginal: 119.99, imagem: celebre, badge: null },
  { id: "k15", slug: "deleite", nome: "Kit Cuide-se Bem Deleite", marca: "O Boticário", descricao: "Aromas envolventes para um momento de puro autocuidado.", preco: 84.99, precoOriginal: 109.99, imagem: deleite, badge: null },
  { id: "k16", slug: "cuide-se-bem-pessegura", nome: "Kit Cuide-se Bem Pessegura", marca: "O Boticário", descricao: "Pele macia e com cheirinho irresistível de pêssego. O toque de carinho que sua mãe merece.", preco: 49.99, precoOriginal: 74.99, imagem: pessegura, badge: "Mega Promoção" },
  { id: "e01", slug: "rosa-absoluta", nome: "Kit Rosa Absoluta", marca: "Eudora", descricao: "Fragrância marcante e envolvente. O toque das rosas para o dia a dia.", preco: 39.99, precoOriginal: 59.99, imagem: rosaAbsoluta, badge: "Novidade" },
  { id: "e02", slug: "kissme-delicious", nome: "Kit Kissme Delicious", marca: "Eudora", descricao: "Um presente irresistível e apaixonante, perfeito para celebrar momentos especiais.", preco: 109.99, precoOriginal: 149.99, imagem: kissmeDelicious, badge: "Novidade" },
  { id: "e03", slug: "eudora-instance", nome: "Kit Eudora Instance Baunilha", marca: "Eudora", descricao: "Hidratação profunda e pele perfumada em instantes com extrato natural.", preco: 29.99, precoOriginal: 44.99, imagem: eudoraInstance, badge: "Mega Promoção" },
  { id: "e04", slug: "diva-fabulosa", nome: "Kit Diva Fabulosa", marca: "Eudora", descricao: "Uma combinação radiante e sofisticada para brilhar em todas as ocasiões.", preco: 99.99, precoOriginal: 139.99, imagem: divaFabulosa, badge: "Novidade" },
  { id: "e05", slug: "la-victorie-intense", nome: "Kit La Victorie Intense", marca: "Eudora", descricao: "Aroma intenso e sedutor, um verdadeiro símbolo de conquista e poder.", preco: 59.99, precoOriginal: 89.99, imagem: laVictorie, badge: "Mega Promoção" },
  { id: "e06", slug: "eudora-roxo", nome: "Kit Eudora Roxo", marca: "Eudora", descricao: "A essência clássica da Eudora em um kit luxuoso e inesquecível.", preco: 129.99, precoOriginal: 179.99, imagem: eudoraRoxo, badge: "Mais Vendido" },
];

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const parcelas = (preco: number) => {
  return { vezes: 12, valor: preco / 12 };
};
