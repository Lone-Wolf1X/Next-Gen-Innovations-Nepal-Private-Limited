export interface Question {
  id: string;
  questionText: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctOption?: string;
  subject?: string;
  difficulty?: string;
}

export interface ModelSet {
  id: string;
  title: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  questions?: Question[];
}

export interface TestState {
  modelSet: ModelSet | null;
  questions: Question[];
  attemptId: string | null;
  currentIndex: number;
  answers: Record<string, string>; // questionId -> 'a'|'b'|'c'|'d'
  markedForReview: Set<string>;
  visitedQuestions: Set<string>;
  timeRemainingSeconds: number;
  isSubmitting: boolean;
}
