'use client';

export function ExamHeader({ questionId }: { questionId: string }) {
  return (
    <header className="border-border border-b bg-background">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-foreground text-lg">
            Question {questionId}
          </h1>
        </div>
        <div className="text-center">
          <h2 className="font-medium text-base text-foreground">
            Bluebook Exams
          </h2>
        </div>
      </div>
    </header>
  );
}
