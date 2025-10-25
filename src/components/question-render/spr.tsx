import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { HtmlMath } from '../exam/math-html';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useSubmissionState } from './hooks';
import { FeedbackAlert, QuestionCard } from './root';
import type {
  IbnQuestionItem,
  IbnSprAnswer,
  IdSprQuestionData,
  SubmissionResult,
} from './types';

export function RenderSpr({
  q,
  onSubmit,
  normalize,
}: {
  q: IbnQuestionItem | IdSprQuestionData;
  onSubmit?: (r: SubmissionResult) => void;
  normalize?: (s: string) => string;
}) {
  const isIbnSpr = 'answer' in q;
  const { submitted, feedback, handleSubmit, reset } =
    useSubmissionState<
      Extract<SubmissionResult, { type: 'ibn_spr' | 'id_spr' }>
    >();
  const [input, setInput] = useState<string>('');

  const { accepted, normalizedAccepted, rationale } = useMemo(() => {
    if (isIbnSpr) {
      const ans = q.answer as IbnSprAnswer;
      return {
        accepted: [],
        normalizedAccepted: new Set<string>(),
        rationale: ans.rationale,
      };
    }
    const acceptedAnswers = q.correct_answer ?? [];
    const normalizedSet = normalize
      ? new Set(acceptedAnswers.map((a) => normalize(a)))
      : new Set<string>();
    return {
      accepted: acceptedAnswers,
      normalizedAccepted: normalizedSet,
      rationale: q.rationale,
    };
  }, [q, isIbnSpr, normalize]);

  const onSubmitClick = useCallback(() => {
    if (isIbnSpr) {
      const result: Extract<SubmissionResult, { type: 'ibn_spr' }> = {
        type: 'ibn_spr',
        input,
        isCorrect: null,
        rationale,
      };
      handleSubmit(result, onSubmit);
    } else {
      const isCorrect = normalize
        ? normalizedAccepted.has(normalize(input))
        : false;
      const result: Extract<SubmissionResult, { type: 'id_spr' }> = {
        type: 'id_spr',
        input,
        acceptedAnswers: accepted,
        isCorrect,
        rationale,
      };
      handleSubmit(result, onSubmit);
    }
    toast('Submitted');
  }, [
    isIbnSpr,
    input,
    rationale,
    normalize,
    normalizedAccepted,
    accepted,
    handleSubmit,
    onSubmit,
  ]);

  const handleReset = useCallback(() => {
    setInput('');
    reset();
  }, [reset]);

  return (
    <QuestionCard>
      <div className="flex items-center gap-3">
        <Input
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer"
          value={input}
        />
        <Button
          className="transition-transform active:scale-[0.98]"
          disabled={!input.trim() || submitted}
          onClick={onSubmitClick}
        >
          Submit
        </Button>
        {!isIbnSpr && (
          <Button
            className="transition-transform active:scale-[0.98]"
            onClick={handleReset}
            variant="secondary"
          >
            Reset
          </Button>
        )}
      </div>

      {feedback &&
        (isIbnSpr ? (
          <Alert className="fade-in slide-in-from-bottom-1 animate-in transition-all duration-300">
            <AlertTitle>Rationale</AlertTitle>
            {rationale && (
              <AlertDescription>
                <div className="prose max-w-none">
                  <HtmlMath html={rationale} />
                </div>
              </AlertDescription>
            )}
          </Alert>
        ) : (
          <FeedbackAlert isCorrect={feedback.isCorrect} rationale={rationale} />
        ))}
    </QuestionCard>
  );
}
