'use client';

import { useExam } from './exam-context';
import { FeedbackPanel } from './feedback-panel';
import { HtmlMath } from './math-html';
import { McqQuestion } from './mcq-question';
import { SprQuestion } from './spr-question';

export function QuestionDisplay() {
  const { questions, currentQuestionIndex, submissionResult } = useExam();
  const currentQuestion = questions[currentQuestionIndex];

  const isMcq =
    ('type' in currentQuestion && currentQuestion.type === 'mcq') ||
    ('answer' in currentQuestion &&
      currentQuestion.answer.style === 'Multiple Choice');

  const isSpr =
    ('type' in currentQuestion && currentQuestion.type === 'spr') ||
    ('answer' in currentQuestion && currentQuestion.answer.style === 'SPR');

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-2">
      <div className="overflow-y-auto border-border border-r bg-background p-8">
        <div className="prose prose-sm max-w-none">
          {'stimulus' in currentQuestion && currentQuestion.stimulus && (
            <div className="mb-6 text-foreground">
              <HtmlMath html={currentQuestion.stimulus} />
            </div>
          )}
          {'body' in currentQuestion && currentQuestion.body && (
            <div className="mb-6 text-foreground">
              <HtmlMath html={currentQuestion.body} />
            </div>
          )}
          <p className="text-foreground leading-relaxed">
            {'stem' in currentQuestion ? (
              <HtmlMath html={currentQuestion.stem} />
            ) : (
              <HtmlMath html={currentQuestion.prompt} />
            )}
          </p>
        </div>
      </div>

      <div className="relative flex flex-col overflow-y-auto bg-background p-8">
        {submissionResult ? (
          <FeedbackPanel />
        ) : (
          <>
            {isMcq && <McqQuestion />}
            {isSpr && <SprQuestion />}
          </>
        )}
      </div>
    </div>
  );
}
