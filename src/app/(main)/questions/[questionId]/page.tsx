import { ExamProvider } from '@/components/exam/exam-context';
import { ExamInterface } from '@/components/exam/exam-interface';

export default function QuestionDetailPage() {
  const question = {
    type: 'mcq' as const,
    stem: "In recommending Bao Phi's collection Song I Sing, a librarian noted that pieces by the spoken-word poet don't lose their _____ nature when printed: the language has the same pleasant musical quality on the page as it does when performed by Phi.",
    answerOptions: [
      { id: 'A', content: 'scholarly' },
      { id: 'B', content: 'melodic' },
      { id: 'C', content: 'jarring' },
      { id: 'D', content: 'personal' },
    ],
    correct_answer: ['B'],
    rationale:
      "The correct answer is 'melodic' because the passage describes the language as having a 'pleasant musical quality,' which directly relates to melodic characteristics.",
    externalid: 'q1',
    keys: ['vocabulary', 'context-clues'],
  };

  return (
    <ExamProvider questions={[question]}>
      <ExamInterface />
    </ExamProvider>
  );
}
