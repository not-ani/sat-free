'use client';

import { QuestionNavigator } from '@/app/(main)/questions/QuestionNavigator';
import { useExam } from './exam-context';

export function ExamFooter() {
  const { currentQuestionId } = useExam();

  return (
    <footer className="border-border border-t bg-background">
      <QuestionNavigator currentQuestionId={currentQuestionId} />
    </footer>
  );
}
