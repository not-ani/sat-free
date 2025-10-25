/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
export const A_CHAR_CODE = 97;

import { cn } from '@/lib/utils';
import { HtmlMath } from '../exam/math-html';
import { useSubmissionState } from './hooks';
import { FeedbackAlert, QuestionCard, SubmitResetButtons } from './root';
import type {
  IdMcqQuestionData,
  IdSprQuestionData,
  SubmissionResult,
} from './types';

export function RenderIdMcq({
  q,
  onSubmit,
}: {
  q: IdMcqQuestionData;
  onSubmit?: (r: SubmissionResult) => void;
}) {
  const { submitted, feedback, handleSubmit, reset } =
    useSubmissionState<Extract<SubmissionResult, { type: 'id_mcq' }>>();
  const [selected, setSelected] = useState<string | null>(null);

  const keysByIndex = useMemo(() => q.keys ?? [], [q.keys]);
  const answerOptions = useMemo(() => q.answerOptions ?? [], [q.answerOptions]);
  const optionIds = useMemo(
    () => answerOptions.map((o) => o.id),
    [answerOptions]
  );
  const optionIdsSet = useMemo(() => new Set(optionIds), [optionIds]);
  const correctRaw = useMemo(() => q.correct_answer ?? [], [q.correct_answer]);

  const normalize = useCallback((s: string) => s.trim().toLowerCase(), []);

  const hasValidKeys = useMemo(
    () => keysByIndex.length > 0 && keysByIndex.length === answerOptions.length,
    [keysByIndex, answerOptions.length]
  );
  const fallbackLetters = useMemo(
    () =>
      Array.from({ length: answerOptions.length }, (_, i) =>
        String.fromCharCode(A_CHAR_CODE + i)
      ),
    [answerOptions.length]
  );
  const displayLabelsUpper = useMemo(
    () => fallbackLetters.map((l) => l.toUpperCase()),
    [fallbackLetters]
  );
  const mappingLabels = useMemo(
    () =>
      hasValidKeys
        ? keysByIndex.map((k) => (k ?? '').toString())
        : fallbackLetters,
    [hasValidKeys, keysByIndex, fallbackLetters]
  );
  const mappingLabelsNormalized = useMemo(
    () => mappingLabels.map((l) => normalize(l)),
    [mappingLabels, normalize]
  );

  const correctByIdSet = useMemo(
    () => new Set(correctRaw.filter((c) => optionIdsSet.has(c))),
    [correctRaw, optionIdsSet]
  );
  const correctNormalizedSet = useMemo(
    () => new Set(correctRaw.map((c) => normalize(c))),
    [correctRaw, normalize]
  );
  const correctLabelIndexSet = useMemo(() => {
    const idxs = new Set<number>();
    mappingLabelsNormalized.forEach((lab, idx) => {
      if (correctNormalizedSet.has(lab)) {
        idxs.add(idx);
      }
    });
    return idxs;
  }, [mappingLabelsNormalized, correctNormalizedSet]);

  const onSubmitClick = useCallback(() => {
    if (!selected) {
      return;
    }
    const index = optionIds.indexOf(selected);
    const selectedLabelNorm =
      index >= 0 ? mappingLabelsNormalized[index] : null;
    const isCorrect =
      correctByIdSet.has(selected) ||
      (!!selectedLabelNorm && correctNormalizedSet.has(selectedLabelNorm));
    let selectedKey: string | null = null;
    if (index >= 0) {
      if (hasValidKeys) {
        selectedKey = keysByIndex[index] ?? null;
      } else {
        selectedKey = displayLabelsUpper[index] ?? null;
      }
    }
    const correctOptionIds = Array.from(correctByIdSet);
    const correctKeys = Array.from(
      correctLabelIndexSet,
      (i) => displayLabelsUpper[i] ?? ''
    );

    const result: Extract<SubmissionResult, { type: 'id_mcq' }> = {
      type: 'id_mcq',
      selectedOptionId: selected,
      selectedKey,
      correctOptionIds,
      correctKeys,
      isCorrect,
      rationale: q.rationale,
    };
    handleSubmit(result, onSubmit);
    toast(isCorrect ? 'Correct!' : 'Incorrect');
  }, [
    selected,
    optionIds,
    mappingLabelsNormalized,
    correctByIdSet,
    correctNormalizedSet,
    hasValidKeys,
    keysByIndex,
    displayLabelsUpper,
    correctLabelIndexSet,
    q.rationale,
    handleSubmit,
    onSubmit,
  ]);

  const handleReset = useCallback(() => {
    setSelected(null);
    reset();
  }, [reset]);

  return (
    <QuestionCard>
      {answerOptions.length ? (
        <RadioGroup
          onValueChange={(v) => setSelected(v)}
          value={selected ?? undefined}
        >
          {answerOptions.map((opt, idx) => {
            const isCorrectOption =
              correctByIdSet.has(opt.id) || correctLabelIndexSet.has(idx);
            const shouldHighlightCorrect =
              submitted && feedback && !feedback.isCorrect && isCorrectOption;
            return (
              <label
                className={cn(
                  'relative flex h-full flex-1 items-start gap-3 rounded-lg border-2 bg-transparent p-4 text-left transition-all',
                  shouldHighlightCorrect &&
                    'bg-emerald-50 ring-2 ring-emerald-300',
                  !shouldHighlightCorrect && 'hover:bg-accent/30'
                )}
                key={opt.id}
              >
                <RadioGroupItem className="mt-1" value={opt.id} />
                <div className="prose flex max-w-none flex-row gap-2 leading-relaxed">
                  <span className="mr-1 font-medium">
                    {displayLabelsUpper[idx]}.
                  </span>{' '}
                  <HtmlMath html={opt.content} />
                </div>
              </label>
            );
          })}
        </RadioGroup>
      ) : null}

      <SubmitResetButtons
        disabled={!selected}
        onReset={handleReset}
        onSubmit={onSubmitClick}
        submitted={submitted}
      />

      {feedback ? (
        <FeedbackAlert isCorrect={feedback.isCorrect} rationale={q.rationale} />
      ) : null}
    </QuestionCard>
  );
}

export function RenderIdSpr({
  q,
  onSubmit,
  normalize,
}: {
  q: IdSprQuestionData;
  onSubmit?: (r: SubmissionResult) => void;
  normalize: (s: string) => string;
}) {
  const { submitted, feedback, handleSubmit, reset } =
    useSubmissionState<Extract<SubmissionResult, { type: 'id_spr' }>>();
  const [input, setInput] = useState<string>('');

  const accepted = useMemo(() => q.correct_answer ?? [], [q.correct_answer]);
  const normalizedAccepted = useMemo(
    () => new Set(accepted.map((a) => normalize(a))),
    [accepted, normalize]
  );

  const onSubmitClick = useCallback(() => {
    const isCorrect = normalizedAccepted.has(normalize(input));
    const result: Extract<SubmissionResult, { type: 'id_spr' }> = {
      type: 'id_spr',
      input,
      acceptedAnswers: accepted,
      isCorrect,
      rationale: q.rationale,
    };
    handleSubmit(result, onSubmit);
    toast('Submitted');
  }, [
    normalizedAccepted,
    normalize,
    input,
    accepted,
    q.rationale,
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
        <Button
          className="transition-transform active:scale-[0.98]"
          onClick={handleReset}
          variant="secondary"
        >
          Reset
        </Button>
      </div>

      {feedback ? (
        <FeedbackAlert isCorrect={feedback.isCorrect} rationale={q.rationale} />
      ) : null}
    </QuestionCard>
  );
}
