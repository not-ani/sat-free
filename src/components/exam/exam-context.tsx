'use client';

import { createContext, type ReactNode, useContext, useState } from 'react';

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

interface IdMcqQuestionData extends IdBaseQuestionData {
  type: 'mcq';
  answerOptions?: IdMcqOption[];
}

interface IdSprQuestionData extends IdBaseQuestionData {
  type: 'spr';
  answerOptions?: unknown[];
}

type IbnMcChoice = {
  body: string;
};

type IbnMcAnswer = {
  style: 'Multiple Choice';
  choices: Record<string, IbnMcChoice>;
  correct_choice: string;
  rationale: string;
};

type IbnSprAnswer = {
  style: 'SPR';
  rationale: string;
};

type IbnQuestionItem = {
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

type ToolMode = 'none' | 'highlight' | 'eliminate';

type ExamContextType = {
  questions: QuestionData[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  sprInput: string;
  eliminatedOptions: Set<string>;
  highlightedText: string[];
  toolMode: ToolMode;
  submissionResult: SubmissionResult | null;
  markedForReview: Set<number>;
  setCurrentQuestionIndex: (index: number) => void;
  setSelectedAnswer: (answer: string | null) => void;
  setSprInput: (input: string) => void;
  toggleEliminatedOption: (optionId: string) => void;
  addHighlight: (text: string) => void;
  removeHighlight: (text: string) => void;
  setToolMode: (mode: ToolMode) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  toggleMarkForReview: () => void;
  resetQuestion: () => void;
};

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({
  children,
  questions,
}: {
  children: ReactNode;
  questions: QuestionData[];
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [sprInput, setSprInput] = useState('');
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<string>>(
    new Set()
  );
  const [highlightedText, setHighlightedText] = useState<string[]>([]);
  const [toolMode, setToolMode] = useState<ToolMode>('none');
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(
    new Set()
  );

  const toggleEliminatedOption = (optionId: string) => {
    setEliminatedOptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        newSet.add(optionId);
      }
      return newSet;
    });
  };

  const addHighlight = (text: string) => {
    setHighlightedText((prev) => [...prev, text]);
  };

  const removeHighlight = (text: string) => {
    setHighlightedText((prev) => prev.filter((t) => t !== text));
  };

  const submitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];

    if ('type' in currentQuestion) {
      // ID-style question
      if (currentQuestion.type === 'mcq') {
        const isCorrect = selectedAnswer
          ? currentQuestion.correct_answer.includes(selectedAnswer)
          : false;
        setSubmissionResult({
          type: 'id_mcq',
          selectedOptionId: selectedAnswer,
          selectedKey: selectedAnswer,
          correctOptionIds: currentQuestion.correct_answer,
          correctKeys: currentQuestion.correct_answer,
          isCorrect,
          rationale: currentQuestion.rationale,
        });
      } else if (currentQuestion.type === 'spr') {
        const isCorrect = currentQuestion.correct_answer.some(
          (answer) => answer.toLowerCase() === sprInput.toLowerCase().trim()
        );
        setSubmissionResult({
          type: 'id_spr',
          input: sprInput,
          acceptedAnswers: currentQuestion.correct_answer,
          isCorrect,
          rationale: currentQuestion.rationale,
        });
      }
    } else if (currentQuestion.answer.style === 'Multiple Choice') {
      const isCorrect =
        selectedAnswer === currentQuestion.answer.correct_choice;
      setSubmissionResult({
        type: 'ibn_mcq',
        selectedKey: selectedAnswer,
        correctKey: currentQuestion.answer.correct_choice,
        isCorrect,
        rationale: currentQuestion.answer.rationale,
      });
    } else {
      setSubmissionResult({
        type: 'ibn_spr',
        input: sprInput,
        isCorrect: null,
        rationale: currentQuestion.answer.rationale,
      });
    }
  };

  const resetQuestion = () => {
    setSelectedAnswer(null);
    setSprInput('');
    setEliminatedOptions(new Set());
    setSubmissionResult(null);
    setToolMode('none');
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetQuestion();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetQuestion();
    }
  };

  const toggleMarkForReview = () => {
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex);
      } else {
        newSet.add(currentQuestionIndex);
      }
      return newSet;
    });
  };

  return (
    <ExamContext.Provider
      value={{
        questions,
        currentQuestionIndex,
        selectedAnswer,
        sprInput,
        eliminatedOptions,
        highlightedText,
        toolMode,
        submissionResult,
        markedForReview,
        setCurrentQuestionIndex,
        setSelectedAnswer,
        setSprInput,
        toggleEliminatedOption,
        addHighlight,
        removeHighlight,
        setToolMode,
        submitAnswer,
        nextQuestion,
        previousQuestion,
        toggleMarkForReview,
        resetQuestion,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
}
