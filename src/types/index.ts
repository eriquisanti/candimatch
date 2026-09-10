export type ProposalCategory =
  | "Economia"
  | "Educação"
  | "Saúde"
  | "Segurança"
  | "Meio ambiente"
  | "Trabalho"
  | "Impostos"
  | "Infraestrutura"
  | "Administração pública"
  | "Agricultura"
  | "Assistência social"
  | "Ciência e tecnologia"
  | "Defesa"
  | "Emprego"
  | "Energia"
  | "Habitação"
  | "Justiça"
  | "Outros"
  | "Política"
  | "Previdência"
  | "Transporte"
  | "Tributação";

export interface Proposal {
  id: string;

  candidateId: string;
  category: ProposalCategory;
  text: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  initials: string;
  colorFrom: string;
  colorTo: string;

  photoUrl?: string;
}

export type UserAnswers = Record<string, boolean>;

export interface CandidateMatch {
  candidate: Candidate;

  percentage: number;

  matchCount: number;

  totalAnswered: number;

  confidenceLowerBound: number;
}
