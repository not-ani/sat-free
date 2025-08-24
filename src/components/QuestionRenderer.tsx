'use client';

import { MathJax } from 'better-react-mathjax';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Generic types for the different question formats we support.
// These mirror (a subset of) the validators defined in convex/schema.ts.

// ---------------------- ID-style ---------------------- //
type IdMcqOption = {
  id: string;
  content: string;
};

type IdBaseQuestionData = {
  stem: string;
  keys?: string[];
  rationale: string;
  externalid: string;
  correct_answer: string[];
  origin?: string;
  templateid?: string;
  vaultid?: string;
  stimulus?: string;
};

interface IdMcqQuestionData extends IdBaseQuestionData {
  type: 'mcq';
  answerOptions?: IdMcqOption[];
}

interface IdSprQuestionData extends IdBaseQuestionData {
  type: 'spr';
  answerOptions?: unknown[];
}

// ---------------------- IBN-style ---------------------- //
type IbnMcChoice = {
  body: string;
};

type IbnMcAnswer = {
  style: 'Multiple Choice';
  choices: Record<string, IbnMcChoice>;
  correct_choice: string;
  rationale: string;
};

type IbnSprAnswer = {
  style: 'SPR';
  rationale: string;
};

type IbnQuestionItem = {
  item_id: string;
  section: string;
  body?: string;
  prompt: string;
  answer: IbnMcAnswer | IbnSprAnswer;
  objective?: string;
};

// The top-level union type we want to handle.
type QuestionData = IdMcqQuestionData | IdSprQuestionData | IbnQuestionItem;

export type SubmissionResult =
  | {
      type: 'id_mcq';
      selectedOptionId: string | null;
      selectedKey: string | null;
      correctOptionIds: string[];
      correctKeys: string[];
      isCorrect: boolean;
      rationale?: string;
    }
  | {
      type: 'id_spr';
      input: string;
      acceptedAnswers: string[];
      isCorrect: boolean;
      rationale?: string;
    }
  | {
      type: 'ibn_mcq';
      selectedKey: string | null;
      correctKey: string;
      isCorrect: boolean;
      rationale?: string;
    }
  | {
      type: 'ibn_spr';
      input: string;
      isCorrect: null;
      rationale?: string;
    };

export type QuestionRendererProps = {
  /**
   * The question_data field coming from the Convex `questions` table.
   */
  questionData: QuestionData;
  /**
   * Optional callback invoked on submission with grading details.
   */
  onSubmit?: (result: SubmissionResult) => void;
};

/**
 * Renders a question stem/prompt along with its answer choices (if any),
 * supporting both the ID-style and IBN-style schemas in `convex/schema.ts`.
 *
 * Math notation inside the question is rendered using `better-react-mathjax`.
 */
export default function QuestionRenderer({
  questionData,
  onSubmit,
}: QuestionRendererProps) {
  const normalize = useCallback(
    (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase(),
    []
  );

  if ('type' in questionData) {
    const q = questionData;
    return q.type === 'mcq' ? (
      <RenderIdMcq onSubmit={onSubmit} q={q} />
    ) : (
      <RenderIdSpr
        normalize={normalize}
        onSubmit={onSubmit}
        q={q as IdSprQuestionData}
      />
    );
  }

  if ('answer' in questionData) {
    const q = questionData as IbnQuestionItem;
    return q.answer.style === 'Multiple Choice' ? (
      <RenderIbnMcq onSubmit={onSubmit} q={q} />
    ) : (
      <RenderIbnSpr onSubmit={onSubmit} q={q} />
    );
  }

  return <div>Unsupported question format.</div>;
}

function HtmlMath({ html }: { html: string }) {
  return (
    <MathJax dynamic inline>
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </MathJax>
  );
}

function RenderIdMcq({
  q,
  onSubmit,
}: {
  q: IdMcqQuestionData;
  onSubmit?: (r: SubmissionResult) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<SubmissionResult | null>(null);
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

  // Labels: prefer provided keys matching options length, else fallback to a, b, c, ...
  const hasValidKeys = useMemo(
    () => keysByIndex.length > 0 && keysByIndex.length === answerOptions.length,
    [keysByIndex, answerOptions.length]
  );
  const fallbackLetters = useMemo(
    () =>
      Array.from({ length: answerOptions.length }, (_, i) =>
        String.fromCharCode(97 + i)
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

  // Correctness resolution supports either option ids or letter keys (case-insensitive)
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

  const onSubmitClick = () => {
    if (!selected) {
      return null;
    }
    const index = optionIds.indexOf(selected);
    const selectedLabelNorm =
      index >= 0 ? mappingLabelsNormalized[index] : null;
    const isCorrect =
      correctByIdSet.has(selected) ||
      (!!selectedLabelNorm && correctNormalizedSet.has(selectedLabelNorm));
    const selectedKey =
      index >= 0
        ? hasValidKeys
          ? (keysByIndex[index] ?? null)
          : (displayLabelsUpper[index] ?? null)
        : null;
    const correctOptionIds = Array.from(correctByIdSet);
    const correctKeys = Array.from(correctLabelIndexSet).map(
      (i) => displayLabelsUpper[i] ?? ''
    );
    const result: SubmissionResult = {
      type: 'id_mcq',
      selectedOptionId: selected,
      selectedKey,
      correctOptionIds,
      correctKeys,
      isCorrect,
      rationale: q.rationale,
    };
    setFeedback(result);
    setSubmitted(true);
    onSubmit?.(result);
    return result;
  };

  return (
    <Card className="fade-in slide-in-from-bottom-1 animate-in space-y-4 transition-all duration-300">
      <CardContent className="space-y-4">
        {q.stimulus ? (
          <div className="prose max-w-none rounded-md border bg-muted/30 p-3 leading-relaxed">
            <HtmlMath html={q.stimulus} />
          </div>
        ) : null}
        <div className="prose max-w-none leading-relaxed">
          <HtmlMath html={q.stem} />
        </div>

        {answerOptions.length ? (
          <RadioGroup
            onValueChange={(v) => setSelected(v)}
            value={selected ?? undefined}
          >
            {answerOptions.map((opt, idx) => {
              const isCorrectOption =
                correctByIdSet.has(opt.id) || correctLabelIndexSet.has(idx);
              const _isSelected = selected === opt.id;
              const shouldHighlightCorrect =
                submitted && feedback && !feedback.isCorrect && isCorrectOption;
              const labelClass = `flex flex-row items-center gap-3 rounded-md p-2 transition-colors ${shouldHighlightCorrect ? 'bg-emerald-50 ring-2 ring-emerald-300' : 'hover:bg-accent/30'}`;
              return (
                <label className={labelClass} key={opt.id}>
                  <RadioGroupItem className="mt-1" value={opt.id} />
                  <div className="prose max-w-none leading-relaxed">
                    <span className="mr-1 font-medium">
                      {displayLabelsUpper[idx]}.
                    </span>
                    <HtmlMath html={opt.content} />
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        ) : null}

        <div className="flex items-center gap-2">
          <Button
            className="transition-transform active:scale-[0.98]"
            disabled={!selected || submitted}
            onClick={() => {
              const result = onSubmitClick();
              if (selected && result && result.type === 'id_mcq') {
                toast(result.isCorrect ? 'Correct!' : 'Incorrect');
              }
            }}
          >
            Submit
          </Button>
          <Button
            className="transition-transform active:scale-[0.98]"
            onClick={() => {
              setSelected(null);
              setSubmitted(false);
              setFeedback(null);
            }}
            variant="secondary"
          >
            Reset
          </Button>
        </div>

        {feedback ? (
          <Alert
            className="fade-in slide-in-from-bottom-1 animate-in transition-all duration-300"
            variant={feedback.isCorrect ? 'default' : 'destructive'}
          >
            {feedback.isCorrect ? <CheckCircle2Icon /> : <XCircleIcon />}
            <AlertTitle>
              {feedback.isCorrect ? 'Correct' : 'Incorrect'}
            </AlertTitle>
            {q.rationale ? (
              <AlertDescription>
                <div className="prose mt-2 max-w-none">
                  <div className="font-semibold">Rationale</div>
                  <HtmlMath html={q.rationale} />
                </div>
              </AlertDescription>
            ) : null}
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RenderIdSpr({
  q,
  onSubmit,
  normalize,
}: {
  q: IdSprQuestionData;
  onSubmit?: (r: SubmissionResult) => void;
  normalize: (s: string) => string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<SubmissionResult | null>(null);
  const [input, setInput] = useState<string>('');

  const accepted = useMemo(() => q.correct_answer ?? [], [q.correct_answer]);
  const normalizedAccepted = useMemo(
    () => new Set(accepted.map((a) => normalize(a))),
    [accepted, normalize]
  );

  const onSubmitClick = () => {
    const isCorrect = normalizedAccepted.has(normalize(input));
    const result: SubmissionResult = {
      type: 'id_spr',
      input,
      acceptedAnswers: accepted,
      isCorrect,
      rationale: q.rationale,
    };
    setFeedback(result);
    setSubmitted(true);
    onSubmit?.(result);
  };

  return (
    <Card className="fade-in slide-in-from-bottom-1 animate-in space-y-4 transition-all duration-300">
      <CardContent className="space-y-4">
        {q.stimulus ? (
          <div className="prose max-w-none rounded-md border bg-muted/30 p-3 leading-relaxed">
            <HtmlMath html={q.stimulus} />
          </div>
        ) : null}
        <div className="prose max-w-none leading-relaxed">
          <HtmlMath html={q.stem} />
        </div>

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
          <Alert
            className="fade-in slide-in-from-bottom-1 animate-in transition-all duration-300"
            variant={feedback.isCorrect ? 'default' : 'destructive'}
          >
            {feedback.isCorrect ? <CheckCircle2Icon /> : <XCircleIcon />}
            <AlertTitle>
              {feedback.isCorrect ? 'Correct' : 'Incorrect'}
            </AlertTitle>
            {q.rationale ? (
              <AlertDescription>
                <div className="prose mt-2 max-w-none">
                  <div className="font-semibold">Rationale</div>
                  <HtmlMath html={q.rationale} />
                </div>
              </AlertDescription>
            ) : null}
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RenderIbnMcq({
  q,
  onSubmit,
}: {
  q: IbnQuestionItem;
  onSubmit?: (r: SubmissionResult) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<SubmissionResult | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const ans = q.answer as IbnMcAnswer;
  const entries = useMemo(
    () => Object.entries(ans.choices ?? {}),
    [ans.choices]
  );

  const onSubmitClick = () => {
    const correctKey = ans.correct_choice;
    const isCorrect = selectedKey === correctKey;
    const result: SubmissionResult = {
      type: 'ibn_mcq',
      selectedKey,
      correctKey,
      isCorrect,
      rationale: ans.rationale,
    };
    setFeedback(result);
    setSubmitted(true);
    onSubmit?.(result);
  };

  return (
    <Card className="fade-in slide-in-from-bottom-1 animate-in space-y-4 transition-all duration-300">
      <CardContent className="space-y-4">
        <div className="prose max-w-none leading-relaxed">
          <HtmlMath html={q.prompt} />
        </div>

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

        <Button
          className="transition-transform active:scale-[0.98]"
          disabled={!selectedKey || submitted}
          onClick={() => {
            onSubmitClick();
            if (selectedKey) {
              toast(feedback?.isCorrect ? 'Correct!' : 'Submitted');
            }
          }}
        >
          Submit
        </Button>

        {feedback ? (
          <Alert
            className="fade-in slide-in-from-bottom-1 animate-in transition-all duration-300"
            variant={feedback.isCorrect ? 'default' : 'destructive'}
          >
            {feedback.isCorrect ? <CheckCircle2Icon /> : <XCircleIcon />}
            <AlertTitle>
              {feedback.isCorrect ? 'Correct' : 'Incorrect'}
            </AlertTitle>
            {ans.rationale ? (
              <AlertDescription>
                <div className="prose mt-2 max-w-none">
                  <div className="font-semibold">Rationale</div>
                  <HtmlMath html={ans.rationale} />
                </div>
              </AlertDescription>
            ) : null}
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RenderIbnSpr({
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
    <Card className="fade-in slide-in-from-bottom-1 animate-in space-y-4 transition-all duration-300">
      <CardContent className="space-y-4">
        <div className="prose max-w-none leading-relaxed">
          <HtmlMath html={q.prompt} />
        </div>

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
      </CardContent>
    </Card>
  );
}
