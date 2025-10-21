'use client';

import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useExam } from './exam-context';

export function SprQuestion() {
  const {
    currentQuestionIndex,
    sprInput,
    setSprInput,
    markedForReview,
    toggleMarkForReview,
    submitAnswer,
  } = useExam();

  const isMarked = markedForReview.has(currentQuestionIndex);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-foreground font-semibold text-background text-sm">
            {currentQuestionIndex + 1}
          </div>
          <Button
            className={cn('gap-2', isMarked && 'text-blue-600')}
            onClick={toggleMarkForReview}
            size="sm"
            variant="ghost"
          >
            <Bookmark className={cn('h-4 w-4', isMarked && 'fill-current')} />
            Mark for Review
          </Button>
        </div>
      </div>

      <div className="font-medium text-foreground text-sm">
        Enter your answer in the box below.
      </div>

      <div className="flex flex-col gap-4">
        <Input
          className="text-base"
          onChange={(e) => setSprInput(e.target.value)}
          placeholder="Type your answer here..."
          type="text"
          value={sprInput}
        />
      </div>

      <Button
        className="mt-4 w-full"
        disabled={!sprInput.trim()}
        onClick={submitAnswer}
        size="lg"
      >
        Submit Answer
      </Button>
    </div>
  );
}
