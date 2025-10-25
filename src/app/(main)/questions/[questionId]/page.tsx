import { api } from '@convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { ExamHeader } from '@/components/question-render/exam-header';
import { QuestionNavigator } from '../QuestionNavigator';

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;

  const question = await fetchQuery(api.questions.getByQuestionId, {
    questionId: decodeURIComponent(questionId),
  });
  if (!question) {
    return notFound();
  }

  const QuestionWithRecorder = dynamic(() => import('../QuestionWithRecorder'));

  return (
    <div className="flex min-h-[90svh] flex-col bg-background p-5">
      {' '}
      <ExamHeader questionId={question.questionId} />
      <div className="flex-1 overflow-hidden">
        <QuestionWithRecorder
          questionData={question.question_data}
          questionId={question.questionId}
        />
      </div>
      <QuestionNavigator currentQuestionId={question.questionId} />
    </div>
  );
}
