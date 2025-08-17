import { fetchQuery } from 'convex/nextjs';
import { notFound } from 'next/navigation';
import QuestionRenderer, {
  type QuestionRendererProps,
} from '@/components/QuestionRenderer';
import { api } from '@/convex/_generated/api';

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

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <h1 className="font-semibold text-2xl">
          Question {question.questionId}
        </h1>
        <p className="text-muted-foreground text-sm">
          {question.subject} • {question.domain} • {question.skill} •{' '}
          {question.difficulty}
        </p>
      </div>
      {/* Question content */}
      <QuestionRenderer
        questionData={
          question.question_data as QuestionRendererProps['questionData']
        }
      />
    </div>
  );
}
