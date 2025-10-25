'use client';

import { Bookmark, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HtmlMath } from '../exam/math-html';

export function StimulusSection({ stimulus }: { stimulus?: string }) {
  if (!stimulus) {
    return null;
  }
  return (
    <div className="prose max-w-none rounded-md border bg-muted/30 p-3 leading-relaxed">
      <HtmlMath html={stimulus} />
    </div>
  );
}

export function QuestionStem({ content }: { content: string }) {
  return (
    <div className="prose max-w-none leading-relaxed">
      <HtmlMath html={content} />
    </div>
  );
}

export function FeedbackAlert({
  isCorrect,
  rationale,
}: {
  isCorrect: boolean | null;
  rationale?: string;
}) {
  const getVariant = () => {
    if (isCorrect === null) {
      return 'default';
    }
    return isCorrect ? 'default' : 'destructive';
  };

  const getTitle = () => {
    if (isCorrect === null) {
      return 'Rationale';
    }
    return isCorrect ? 'Correct' : 'Incorrect';
  };

  return (
    <Alert
      className="fade-in slide-in-from-bottom-1 animate-in transition-all duration-300"
      variant={getVariant()}
    >
      {isCorrect !== null &&
        (isCorrect ? <CheckCircle2Icon /> : <XCircleIcon />)}
      <AlertTitle>{getTitle()}</AlertTitle>
      {rationale ? (
        <AlertDescription>
          <div className="prose mt-2 max-w-none">
            <div className="font-semibold">Rationale</div>
            <HtmlMath html={rationale} />
          </div>
        </AlertDescription>
      ) : null}
    </Alert>
  );
}

export function QuestionCard({ children }: { children: ReactNode }) {
  const [isMarked, setIsMarked] = useState(false);
  const toggleMarkForReview = () => {
    setIsMarked(!isMarked);
  };
  return (
    <div className="relative flex flex-col overflow-y-auto bg-background p-8">
      <div className="flex flex-col gap-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full items-center gap-2 bg-gray-200">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-foreground font-semibold text-background text-sm">
              ss
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

        <div className="flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}

export function SubmitResetButtons({
  onSubmit,
  onReset,
  disabled,
  submitted,
  showReset = true,
}: {
  onSubmit: () => void;
  onReset: () => void;
  disabled: boolean;
  submitted: boolean;
  showReset?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        className="transition-transform active:scale-[0.98]"
        disabled={disabled || submitted}
        onClick={onSubmit}
      >
        Submit
      </Button>
      {showReset && (
        <Button
          className="transition-transform active:scale-[0.98]"
          onClick={onReset}
          variant="secondary"
        >
          Reset
        </Button>
      )}
    </div>
  );
}
