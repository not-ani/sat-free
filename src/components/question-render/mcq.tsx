/** biome-ignore-all lint/a11y/noLabelWithoutControl: I don't even get this rule and it's not even a11y related */
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { HtmlMath } from '../exam/math-html';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useSubmissionState } from './hooks';
import { FeedbackAlert, QuestionCard, SubmitResetButtons } from './root';
import type {
  IbnMcAnswer,
  IbnQuestionItem,
  IdMcqQuestionData,
  SubmissionResult,
} from './types';
export const A_CHAR_CODE = 65;

export function RenderMcq({
  q,
  onSubmit,
}: {
  q: IbnQuestionItem | IdMcqQuestionData;
  onSubmit?: (r: SubmissionResult) => void;
}) {
  const isIbnMcq = 'answer' in q;
  const { submitted, feedback, handleSubmit, reset } =
    useSubmissionState<
      Extract<SubmissionResult, { type: 'ibn_mcq' | 'id_mcq' }>
    >();
  const [selected, setSelected] = useState<string | null>(null);

  // Normalize choices to common format
  const { choices, correctSet, rationale } = useMemo(() => {
    if (isIbnMcq) {
      const ans = q.answer as IbnMcAnswer;
      const entries = Object.entries(ans.choices ?? {});
      return {
        choices: entries.map(([key, choice]) => ({
          id: key,
          label: key,
          content: choice.body,
        })),
        correctSet: new Set([ans.correct_choice]),
        rationale: ans.rationale,
      };
    }
    const opts = q.answerOptions ?? [];
    const labels = opts.map((_, i) =>
      String.fromCharCode(A_CHAR_CODE + i).toUpperCase()
    );
    const correctIds = new Set(q.correct_answer ?? []);
    const correctLabels = new Set(
      (q.correct_answer ?? []).map((c) => c.trim().toLowerCase())
    );

    return {
      choices: opts.map((opt, i) => ({
        id: opt.id,
        label: labels[i],
        content: opt.content,
      })),
      correctSet: new Set([
        ...Array.from(correctIds),
        ...labels
          .filter((_, i) => correctLabels.has(labels[i].toLowerCase()))
          .map((_, i) => opts[i].id),
      ]),
      rationale: q.rationale,
    };
  }, [q, isIbnMcq]);

  const onSubmitClick = useCallback(() => {
    if (!selected) {
      return;
    }

    const isCorrect = correctSet.has(selected);

    if (isIbnMcq) {
      const result: Extract<SubmissionResult, { type: 'ibn_mcq' }> = {
        type: 'ibn_mcq',
        selectedKey: selected,
        correctKey: Array.from(correctSet)[0],
        isCorrect,
        rationale,
      };
      handleSubmit(result, onSubmit);
    } else {
      const selectedChoice = choices.find((c) => c.id === selected);
      const correctChoices = choices.filter((c) => correctSet.has(c.id));

      const result: Extract<SubmissionResult, { type: 'id_mcq' }> = {
        type: 'id_mcq',
        selectedOptionId: selected,
        selectedKey: selectedChoice?.label ?? null,
        correctOptionIds: correctChoices.map((c) => c.id),
        correctKeys: correctChoices.map((c) => c.label),
        isCorrect,
        rationale,
      };
      handleSubmit(result, onSubmit);
    }

    toast(isCorrect ? 'Correct!' : 'Incorrect');
  }, [
    selected,
    correctSet,
    isIbnMcq,
    rationale,
    choices,
    handleSubmit,
    onSubmit,
  ]);

  const handleReset = useCallback(() => {
    setSelected(null);
    reset();
  }, [reset]);

  return (
    <QuestionCard>
      <RadioGroup
        onValueChange={(v) => setSelected(v)}
        value={selected ?? undefined}
      >
        {choices.map((choice) => {
          const isCorrectChoice = correctSet.has(choice.id);
          const shouldHighlight =
            !isIbnMcq &&
            submitted &&
            feedback &&
            !feedback.isCorrect &&
            isCorrectChoice;

          return (
            <label
              className={cn(
                'flex items-start gap-3 rounded-lg p-4 transition-all',
                isIbnMcq
                  ? 'rounded-md p-2 hover:bg-accent/30'
                  : 'border-2 bg-transparent text-left',
                shouldHighlight && 'bg-emerald-50 ring-2 ring-emerald-300',
                !(shouldHighlight || isIbnMcq) && 'hover:bg-accent/30'
              )}
              key={choice.id}
            >
              <RadioGroupItem
                className={isIbnMcq ? '' : 'mt-1'}
                value={choice.id}
              />
              <div className="prose flex max-w-none flex-row gap-2 leading-relaxed">
                <span className="mr-1 font-medium">{choice.label}.</span>
                <HtmlMath html={choice.content} />
              </div>
            </label>
          );
        })}
      </RadioGroup>

      <SubmitResetButtons
        disabled={!selected}
        onReset={handleReset}
        onSubmit={onSubmitClick}
        submitted={submitted}
      />

      {feedback && (
        <FeedbackAlert isCorrect={feedback.isCorrect} rationale={rationale} />
      )}
    </QuestionCard>
  );
}
