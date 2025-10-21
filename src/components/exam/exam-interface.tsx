'use client';

import { ExamFooter } from './exam-footer';
import { ExamHeader } from './exam-header';
import { QuestionDisplay } from './question-display';

export function ExamInterface() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ExamHeader />
      <div className="flex-1 overflow-hidden">
        <QuestionDisplay />
      </div>
      <ExamFooter />
    </div>
  );
}
