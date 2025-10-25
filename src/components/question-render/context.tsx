'use client';
import { createContext, useContext, useState } from 'react';

type QuestionRenderContextType = {
  toggleEliminatedOption: (optionId: string) => void;
  eliminatedOptions: Set<string>;
};

const QuestionRenderContext = createContext<
  QuestionRenderContextType | undefined
>(undefined);

export function QuestionRenderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<string>>(
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
  return (
    <QuestionRenderContext.Provider
      value={{ eliminatedOptions, toggleEliminatedOption }}
    >
      {children}
    </QuestionRenderContext.Provider>
  );
}

export function useQuestionRender() {
  const context = useContext(QuestionRenderContext);
  if (!context) {
    throw new Error(
      'useQuestionRender must be used within a QuestionRenderProvider'
    );
  }
  return context;
}
