// Shared shapes for the Phase 2 practice/study flow. Mirrors questions/options/rationales
// (see 05-Dev/schema.md) — only the columns the renderer needs.

export type QuestionFormat = "completion" | "question" | "negative";

export type PracticeOption = {
  id: string;
  label: string;
  body: string;
  is_correct: boolean;
  distractor_rationale: string | null;
  sort_order: number;
};

export type PracticeQuestion = {
  id: string;
  slug: string;
  format: QuestionFormat;
  stem: string;
  difficulty: string;
  options: PracticeOption[];
  correct_explanation: string | null;
  flagged: boolean;
  is_trick: boolean;
};
