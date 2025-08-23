'use client';

import { api } from '@convex/_generated/api';
import { useMutation } from 'convex/react';
import { toast } from 'sonner';
import QuestionRenderer, {
  type QuestionRendererProps,
  type SubmissionResult,
} from '@/components/QuestionRenderer';

export default function QuestionWithRecorder({
  questionId,
  questionData,
}: {
  questionId: string;
  questionData: QuestionRendererProps['questionData'];
}) {
  const recordAttempt = useMutation(api.myFunctions.recordAttempt);

  const handleSubmit = async (result: SubmissionResult) => {
    try {
      await recordAttempt({ questionId, result });
      if (typeof (result as any)?.isCorrect === 'boolean') {
        toast(
          (result as any).isCorrect
            ? 'Recorded: Correct'
            : 'Recorded: Incorrect'
        );
      } else {
        toast('Recorded');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Likely not signed in
      toast.error(message || 'Failed to record attempt');
    }
  };

  return (
    <QuestionRenderer onSubmit={handleSubmit} questionData={questionData} />
  );
}
