import lily from "@/assets/kits/lily-tradicional.png";
import glamour from "@/assets/kits/glamour-secrets-black.png";
import elysee from "@/assets/kits/elysee-tradicional.png";
import coffee from "@/assets/kits/coffee-woman-duo.png";
import florattaRose from "@/assets/kits/floratta-rose.png";
import lilyCuidados from "@/assets/kits/lily-cuidados.png";
import ameixa from "@/assets/kits/ameixa-tradicional.png";
import liz from "@/assets/kits/liz-tradicional.png";
import egeoDolce from "@/assets/kits/egeo-dolce.png";
import herCode from "@/assets/kits/her-code-tradicional.png";
import celebre from "@/assets/kits/celebre-sua-forca.png";
import deleite from "@/assets/kits/deleite.png";
import egeoChoc from "@/assets/kits/egeo-choc.png";
import herCodeBody from "@/assets/kits/her-code-body-splash.png";
import florattaRed from "@/assets/kits/floratta-red.png";

export type Badge = "Mais Vendido" | "Edição Especial" | "Novidade" | null;

export type Kit = {
  id: string;
  slug: string;
  nome: string;
  marca: string;
  descricao: string;
  preco: number;
  imagem: string;
  badge: Badge;
};

export const KITS: Kit[] = [
  { id: "k01", slug: "lily-tradicional", nome: "Kit Lily Tradicional", marca: "O Boticário", descricao: "Eau de Parfum + creme hidratante. Sofisticado, floral e atemporal.", preco: 249.99, imagem: lily, badge: "Mais Vendido" },
  { id: "k02", slug: "elysee-tradicional", nome: "Kit Elysée Tradicional", marca: "O Boticário", descricao: "Floral oriental envolvente, presente de alto valor afetivo.", preco: 289.99, imagem: elysee, badge: "Edição Especial" },
  { id: "k03", slug: "her-code-tradicional", nome: "Kit Her Code Tradicional", marca: "O Boticário", descricao: "Frasco icônico em cadeado, fragrância marcante e moderna.", preco: 244.99, imagem: herCode, badge: "Edição Especial" },
  { id: "k04", slug: "coffee-woman-duo", nome: "Kit Coffee Woman Duo", marca: "O Boticário", descricao: "Loção corporal + creme para mãos. Aroma quente e adocicado.", preco: 219.99, imagem: coffee, badge: null },
  { id: "k05", slug: "floratta-red", nome: "Kit Floratta Red", marca: "O Boticário", descricao: "Perfume + loção + sabonete líquido floral envolvente.", preco: 184.99, imagem: florattaRed, badge: null },
  { id: "k06", slug: "liz-tradicional", nome: "Kit Liz Tradicional", marca: "O Boticário", descricao: "Perfume, hidratante e necessaire — feito para presentear.", preco: 179.99, imagem: liz, badge: null },
  { id: "k07", slug: "egeo-dolce", nome: "Kit Egeo Dolce", marca: "O Boticário", descricao: "Doce, jovem e brincalhão. Para mães cheias de leveza.", preco: 174.99, imagem: egeoDolce, badge: "Mais Vendido" },
  { id: "k08", slug: "glamour-secrets-black", nome: "Kit Glamour Secrets Black", marca: "O Boticário", descricao: "Perfume sensual e creme aveludado em embalagem premium.", preco: 149.99, imagem: glamour, badge: null },
  { id: "k09", slug: "lily-cuidados", nome: "Kit Lily Cuidados", marca: "O Boticário", descricao: "Linha de cuidados Lily com hidratação e perfume marcante.", preco: 144.99, imagem: lilyCuidados, badge: null },
  { id: "k10", slug: "floratta-rose", nome: "Kit Floratta Rose", marca: "O Boticário", descricao: "Romântico e delicado, com perfume e creme hidratante.", preco: 144.99, imagem: florattaRose, badge: "Mais Vendido" },
  { id: "k11", slug: "egeo-choc", nome: "Kit Egeo Choc", marca: "O Boticário", descricao: "O clássico do chocolate, em uma combinação irresistível.", preco: 134.99, imagem: egeoChoc, badge: null },
  { id: "k12", slug: "her-code-body-splash", nome: "Kit Her Code Body Splash", marca: "O Boticário", descricao: "Body splash refrescante em dupla para o dia a dia.", preco: 129.99, imagem: herCodeBody, badge: null },
  { id: "k13", slug: "ameixa-tradicional", nome: "Kit Ameixa Tradicional Nativa SPA", marca: "Nativa SPA", descricao: "Sabonete + loção corporal com fragrância clássica de ameixa.", preco: 99.99, imagem: ameixa, badge: null },
  { id: "k14", slug: "celebre-sua-forca", nome: "Kit Celebre Sua Força", marca: "O Boticário", descricao: "Perfume + creme para mãos. Mensagem que transborda carinho.", preco: 99.99, imagem: celebre, badge: null },
  { id: "k15", slug: "deleite", nome: "Kit Cuide-se Bem Deleite", marca: "O Boticário", descricao: "Aromas envolventes para um momento de puro autocuidado.", preco: 84.99, imagem: deleite, badge: null },
  { id: "k16", slug: "cuide-se-bem-pessegura", nome: "Kit Cuide-se Bem Pessegura", marca: "O Boticário", descricao: "Loção hidratante + body spray com aroma frutal de pêssego.", preco: 54.99, imagem: "https://www.boticario.com.br/on/demandware.static/-/Sites-boticario-master-catalog/default/dw10d5e5e3/Imagens_Produtos/B53770/B53770_1.jpg", badge: null },
];

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const parcelas = (preco: number) => {
  return { vezes: 12, valor: preco / 12 };
};
