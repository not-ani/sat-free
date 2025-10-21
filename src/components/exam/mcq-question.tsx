'use client';

import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useExam } from './exam-context';

export function McqQuestion() {
  const {
    questions,
    currentQuestionIndex,
    selectedAnswer,
    setSelectedAnswer,
    eliminatedOptions,
    toggleEliminatedOption,
    toolMode,
    markedForReview,
    toggleMarkForReview,
    submitAnswer,
  } = useExam();

  const currentQuestion = questions[currentQuestionIndex];
  const isMarked = markedForReview.has(currentQuestionIndex);

  let options: { id: string; content: string }[] = [];
  if ('type' in currentQuestion && currentQuestion.type === 'mcq') {
    options = currentQuestion.answerOptions || [];
  } else if (
    'answer' in currentQuestion &&
    currentQuestion.answer.style === 'Multiple Choice'
  ) {
    options = Object.entries(currentQuestion.answer.choices).map(
      ([key, choice]) => ({
        id: key,
        content: choice.body,
      })
    );
  }

  const handleOptionClick = (optionId: string) => {
    if (toolMode !== 'eliminate' && !eliminatedOptions.has(optionId)) {
      setSelectedAnswer(optionId);
    }
  };

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
        Which choice completes the text with the most logical and precise word
        or phrase?
      </div>

      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isEliminated = eliminatedOptions.has(option.id);
          const isSelected = selectedAnswer === option.id;

          return (
            <div className="relative flex items-center gap-2" key={option.id}>
              <Button
                className={cn(
                  'relative flex flex-1 items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                  isSelected && !isEliminated && 'border-foreground bg-accent',
                  !isSelected && 'border-border hover:border-muted-foreground',
                  isEliminated && 'border-muted bg-muted/30'
                )}
                onClick={() => handleOptionClick(option.id)}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 font-medium text-sm',
                    isSelected && !isEliminated
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-muted-foreground text-muted-foreground',
                    isEliminated && 'opacity-50'
                  )}
                >
                  {option.id}
                </div>
                <div
                  className={cn(
                    'flex-1 pt-0.5 text-foreground',
                    isEliminated && 'text-muted-foreground line-through'
                  )}
                >
                  {option.content}
                </div>
              </Button>

              {toolMode === 'eliminate' && (
                <Button
                  aria-label={
                    isEliminated ? 'Undo elimination' : 'Eliminate option'
                  }
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    isEliminated
                      ? 'border-muted-foreground text-muted-foreground hover:border-foreground hover:text-foreground'
                      : 'border-muted-foreground text-muted-foreground hover:border-foreground hover:text-foreground'
                  )}
                  onClick={() => toggleEliminatedOption(option.id)}
                >
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full border-2 font-medium text-xs',
                      isEliminated && 'border-muted-foreground line-through'
                    )}
                  >
                    {option.id}
                  </div>
                </Button>
              )}

              {isEliminated && toolMode === 'eliminate' && (
                <Button
                  className="-right-14 absolute text-blue-600 text-sm underline hover:text-blue-700"
                  onClick={() => toggleEliminatedOption(option.id)}
                >
                  Undo
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <Button
        className="mt-4 w-full"
        disabled={!selectedAnswer}
        onClick={submitAnswer}
        size="lg"
      >
        Submit Answer
      </Button>
    </div>
  );
}
