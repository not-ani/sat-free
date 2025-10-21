'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useExam } from './exam-context';

export function FeedbackPanel() {
  const { submissionResult, nextQuestion, currentQuestionIndex, questions } =
    useExam();

  if (!submissionResult) {
    return null;
  }

  const isCorrect =
    submissionResult.type === 'ibn_spr' ? null : submissionResult.isCorrect;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="fade-in slide-in-from-bottom-4 flex animate-in flex-col gap-6 duration-500">
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border-2 p-4',
          isCorrect === true &&
            'border-green-500 bg-green-50 dark:bg-green-950/20',
          isCorrect === false && 'border-red-500 bg-red-50 dark:bg-red-950/20',
          isCorrect === null && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
        )}
      >
        {isCorrect === true && (
          <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />
        )}
        {isCorrect === false && (
          <XCircle className="h-6 w-6 shrink-0 text-red-600" />
        )}
        <div>
          <div className="font-semibold">
            {isCorrect === true && 'Correct!'}
            {isCorrect === false && 'Incorrect'}
            {isCorrect === null && 'Answer Submitted'}
          </div>
          {submissionResult.type === 'id_mcq' && isCorrect === false && (
            <div className="mt-1 text-muted-foreground text-sm">
              The correct answer is: {submissionResult.correctKeys.join(', ')}
            </div>
          )}
          {submissionResult.type === 'ibn_mcq' && isCorrect === false && (
            <div className="mt-1 text-muted-foreground text-sm">
              The correct answer is: {submissionResult.correctKey}
            </div>
          )}
        </div>
      </div>

      {submissionResult.rationale && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-2 font-semibold text-foreground">Explanation</div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {submissionResult.rationale}
          </p>
        </div>
      )}

      <Button
        className="w-full"
        disabled={isLastQuestion}
        onClick={nextQuestion}
        size="lg"
      >
        {isLastQuestion ? 'End of Questions' : 'Continue to Next Question'}
      </Button>
    </div>
  );
}
