'use client';

export type QuestionRendererProps = {
  questionData: QuestionData;

  onSubmit?: (result: SubmissionResult) => void;
};

type IdMcqOption = {
  id: string;
  content: string;
};
type IdBaseQuestionData = {
  stem: string;
  keys?: string[];
  rationale: string;
  externalid: string;
  correct_answer: string[];
  origin?: string;
  templateid?: string;
  vaultid?: string;
  stimulus?: string;
};
export interface IdMcqQuestionData extends IdBaseQuestionData {
  type: 'mcq';
  answerOptions?: IdMcqOption[];
}

export interface IdSprQuestionData extends IdBaseQuestionData {
  type: 'spr';
  answerOptions?: unknown[];
}

type IbnMcChoice = {
  body: string;
};
export type IbnMcAnswer = {
  style: 'Multiple Choice';
  choices: Record<string, IbnMcChoice>;
  correct_choice: string;
  rationale: string;
};
export type IbnSprAnswer = {
  style: 'SPR';
  rationale: string;
};

export type IbnQuestionItem = {
  item_id: string;
  section: string;
  body?: string;
  prompt: string;
  answer: IbnMcAnswer | IbnSprAnswer;
  objective?: string;
};

export type QuestionData =
  | IdMcqQuestionData
  | IdSprQuestionData
  | IbnQuestionItem;

export type SubmissionResult =
  | {
      type: 'id_mcq';
      selectedOptionId: string | null;
      selectedKey: string | null;
      correctOptionIds: string[];
      correctKeys: string[];
      isCorrect: boolean;
      rationale?: string;
    }
  | {
      type: 'id_spr';
      input: string;
      acceptedAnswers: string[];
      isCorrect: boolean;
      rationale?: string;
    }
  | {
      type: 'ibn_mcq';
      selectedKey: string | null;
      correctKey: string;
      isCorrect: boolean;
      rationale?: string;
    }
  | {
      type: 'ibn_spr';
      input: string;
      isCorrect: null;
      rationale?: string;
    };
