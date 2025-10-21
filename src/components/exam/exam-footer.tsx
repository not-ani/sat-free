'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExam } from './exam-context';

export function ExamFooter() {
  const {
    currentQuestionIndex,
    questions,
    previousQuestion,
    nextQuestion,
    submissionResult,
  } = useExam();

  const canGoPrevious = currentQuestionIndex > 0;
  const canGoNext = currentQuestionIndex < questions.length - 1;

  return (
    <footer className="border-border border-t bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="font-medium text-muted-foreground text-sm">
          Susan Bassow
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2 bg-transparent"
            disabled={!canGoPrevious}
            onClick={previousQuestion}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="rounded-full bg-foreground px-4 py-2 font-medium text-background text-sm">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <Button
            className="gap-2"
            disabled={!(canGoNext && submissionResult)}
            onClick={nextQuestion}
            size="sm"
            variant="default"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-32" /> {/* Spacer for balance */}
      </div>
    </footer>
  );
}
