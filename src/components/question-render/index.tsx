'use client';
import { useCallback } from 'react';
import { HtmlMath } from '../exam/math-html';
import { QuestionRenderProvider } from './context';
import { RenderMcq } from './mcq';
import { RenderSpr } from './spr';
import type { QuestionRendererProps } from './types';

export function QuestionRenderer({
  questionData,
  onSubmit,
}: QuestionRendererProps) {
  const normalize = useCallback((s: string) => s.trim().toLowerCase(), []);
  const isMcq =
    ('type' in questionData && questionData.type === 'mcq') ||
    ('answer' in questionData &&
      questionData.answer.style === 'Multiple Choice');
  const isSpr =
    ('type' in questionData && questionData.type === 'spr') ||
    ('answer' in questionData && questionData.answer.style === 'SPR');

  const renderQuestion = useCallback(() => {
    if (isMcq) {
      return <RenderMcq onSubmit={onSubmit} q={questionData} />;
    }
    if (isSpr) {
      return (
        <RenderSpr normalize={normalize} onSubmit={onSubmit} q={questionData} />
      );
    }
    return <div>Unsupported question format.</div>;
  }, [isMcq, isSpr, normalize, onSubmit, questionData]);

  return (
    <QuestionRenderProvider>
      <div className="grid h-full grid-cols-1 lg:grid-cols-2">
        <div className="overflow-y-auto border-border border-r bg-background p-8">
          <div className="prose prose-sm max-w-none">
            {'stimulus' in questionData && questionData.stimulus && (
              <div className="mb-6 text-foreground">
                <HtmlMath html={questionData.stimulus} />
              </div>
            )}
            {'body' in questionData && questionData.body && (
              <div className="mb-6 text-foreground">
                <HtmlMath html={questionData.body} />
              </div>
            )}
            <p className="text-foreground leading-relaxed">
              {'stem' in questionData ? (
                <HtmlMath html={questionData.stem} />
              ) : (
                <HtmlMath html={questionData.prompt} />
              )}
            </p>
          </div>
        </div>
        {renderQuestion()}
      </div>
    </QuestionRenderProvider>
  );
}
