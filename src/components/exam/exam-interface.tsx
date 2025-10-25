'use client';

import { ExamHeader } from '../question-render/exam-header';
import { ExamFooter } from './exam-footer';
import { QuestionDisplay } from './question-display';

export function ExamInterface({ questionId }: { questionId: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ExamHeader questionId={questionId} />
      <div className="flex-1 overflow-hidden">
        <QuestionDisplay />
      </div>
      <ExamFooter />
    </div>
  );
}
