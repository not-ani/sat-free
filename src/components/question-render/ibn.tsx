/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { HtmlMath } from '../exam/math-html';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useSubmissionState } from './hooks';
import { FeedbackAlert, QuestionCard, SubmitResetButtons } from './root';
import type {
  IbnMcAnswer,
  IbnQuestionItem,
  IbnSprAnswer,
  SubmissionResult,
} from './types';

export function RenderIbnMcq({
  q,
  onSubmit,
}: {
  q: IbnQuestionItem;
  onSubmit?: (r: SubmissionResult) => void;
}) {
  const { submitted, feedback, handleSubmit, reset } =
    useSubmissionState<Extract<SubmissionResult, { type: 'ibn_mcq' }>>();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const ans = q.answer as IbnMcAnswer;
  const entries = useMemo(
    () => Object.entries(ans.choices ?? {}),
    [ans.choices]
  );

  const onSubmitClick = useCallback(() => {
    if (!selectedKey) {
      return;
    }
    const correctKey = ans.correct_choice;
    const isCorrect = selectedKey === correctKey;
    const result: Extract<SubmissionResult, { type: 'ibn_mcq' }> = {
      type: 'ibn_mcq',
      selectedKey,
      correctKey,
      isCorrect,
      rationale: ans.rationale,
    };
    handleSubmit(result, onSubmit);
    toast(isCorrect ? 'Correct!' : 'Submitted');
  }, [selectedKey, ans.correct_choice, ans.rationale, handleSubmit, onSubmit]);

  const handleReset = useCallback(() => {
    setSelectedKey(null);
    reset();
  }, [reset]);

  return (
    <QuestionCard>
      <RadioGroup
        onValueChange={(v) => setSelectedKey(v)}
        value={selectedKey ?? undefined}
      >
        {entries.map(([key, choice]) => (
          <label
            className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-accent/30"
            key={key}
          >
            <RadioGroupItem value={key} />
            <div className="prose max-w-none leading-relaxed">
              <span className="mr-1 font-medium">{key}.</span>
              <HtmlMath html={choice.body} />
            </div>
          </label>
        ))}
      </RadioGroup>

      <SubmitResetButtons
        disabled={!selectedKey}
        onReset={handleReset}
        onSubmit={onSubmitClick}
        submitted={submitted}
      />

      {feedback ? (
        <FeedbackAlert
          isCorrect={feedback.isCorrect}
          rationale={ans.rationale}
        />
      ) : null}
    </QuestionCard>
  );
}

export function RenderIbnSpr({
  q,
  onSubmit,
}: {
  q: IbnQuestionItem;
  onSubmit?: (r: SubmissionResult) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<SubmissionResult | null>(null);
  const [input, setInput] = useState<string>('');
  const ans = q.answer as IbnSprAnswer;

  const onSubmitClick = () => {
    const result: SubmissionResult = {
      type: 'ibn_spr',
      input,
      isCorrect: null,
      rationale: ans.rationale,
    };
    setFeedback(result);
    setSubmitted(true);
    onSubmit?.(result);
  };

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
          onClick={() => {
            onSubmitClick();
            if (input.trim()) {
              toast('Submitted');
            }
          }}
        >
          Submit
        </Button>
      </div>

      {feedback ? (
        <Alert className="fade-in slide-in-from-bottom-1 animate-in transition-all duration-300">
          <AlertTitle>Rationale</AlertTitle>
          {ans.rationale ? (
            <AlertDescription>
              <div className="prose max-w-none">
                <HtmlMath html={ans.rationale} />
              </div>
            </AlertDescription>
          ) : null}
        </Alert>
      ) : null}
    </QuestionCard>
  );
}
