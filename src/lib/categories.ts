import type { ProposalCategoryCode } from "@/types/category";
import type { ProposalCategory } from "@/types";

export const CATEGORY_CODE_TO_LABEL: Record<ProposalCategoryCode, ProposalCategory> = {
  ECONOMIA: "Economia",
  EDUCACAO: "Educação",
  SAUDE: "Saúde",
  SEGURANCA: "Segurança",
  MEIO_AMBIENTE: "Meio ambiente",
  TRABALHO: "Trabalho",
  IMPOSTOS: "Impostos",
  INFRAESTRUTURA: "Infraestrutura",
  ADMINISTRACAO_PUBLICA: "Administração pública",
  AGRICULTURA: "Agricultura",
  ASSISTENCIA_SOCIAL: "Assistência social",
  CIENCIA_TECNOLOGIA: "Ciência e tecnologia",
  DEFESA: "Defesa",
  EMPREGO: "Emprego",
  ENERGIA: "Energia",
  HABITACAO: "Habitação",
  JUSTICA: "Justiça",
  OUTROS: "Outros",
  POLITICA: "Política",
  PREVIDENCIA: "Previdência",
  TRANSPORTE: "Transporte",
  TRIBUTACAO: "Tributação",
};

export function categoryCodeToLabel(code: ProposalCategoryCode): ProposalCategory {
  return CATEGORY_CODE_TO_LABEL[code];
}
