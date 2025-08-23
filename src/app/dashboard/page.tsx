import { api } from '@convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function DashboardPage() {
  const attempts = await fetchQuery(api.myFunctions.listMyAttempts, {});

  const total = attempts.length;
  const correct = attempts.filter((a) => a.isCorrect === true).length;
  const incorrect = attempts.filter((a) => a.isCorrect === false).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const bySubject = groupBy(attempts, (a) => a.subject);
  const byDomain = groupBy(attempts, (a) => a.domain);
  const bySkill = groupBy(attempts, (a) => a.skill);

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="mb-2">
        <h1 className="font-semibold text-2xl">Your Dashboard</h1>
        <p className="text-muted-foreground">Track your question progress.</p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Attempted" value={total} />
        <StatCard label="Correct" value={correct} />
        <StatCard label="Incorrect" value={incorrect} />
        <StatCard label="Accuracy" value={`${accuracy}%`} />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <BreakdownCard groups={bySubject} title="By Subject" />
        <BreakdownCard groups={byDomain} title="By Domain" />
        <BreakdownCard groups={bySkill} title="By Skill" />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">Recent Attempts</h2>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">When</th>
                <th className="p-3">Question</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Domain</th>
                <th className="p-3">Skill</th>
                <th className="p-3">Result</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr className="border-t" key={a._id}>
                  <td className="p-3 text-muted-foreground">
                    {format(a.createDate, 'PP p')}
                  </td>
                  <td className="p-3">
                    <Link
                      className="text-primary underline-offset-4 hover:underline"
                      href={`/questions/${encodeURIComponent(a.questionId)}`}
                    >
                      {a.questionId}
                    </Link>
                  </td>
                  <td className="p-3">{a.subject}</td>
                  <td className="p-3">{a.domain}</td>
                  <td className="p-3">{a.skill}</td>
                  <td className="p-3">
                    {a.isCorrect === null ? (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs">
                        N/A
                      </span>
                    ) : a.isCorrect ? (
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-600 text-xs">
                        Correct
                      </span>
                    ) : (
                      <span className="rounded bg-red-500/10 px-2 py-0.5 text-red-600 text-xs">
                        Incorrect
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </div>
      <div className="font-semibold text-2xl">{value}</div>
    </div>
  );
}

function BreakdownCard({
  title,
  groups,
}: {
  title: string;
  groups: Record<string, { total: number; correct: number; incorrect: number }>;
}) {
  return (
    <div className="rounded-md border p-4">
      <div className="mb-2 font-medium">{title}</div>
      <div className="space-y-1 text-sm">
        {Object.entries(groups).map(([k, v]) => (
          <div className="flex items-center justify-between" key={k}>
            <span className="truncate pr-3">{k}</span>
            <span className="text-muted-foreground">
              {v.correct}/{v.total} correct (
              {Math.round((v.correct / Math.max(v.total, 1)) * 100)}%)
            </span>
          </div>
        ))}
        {Object.keys(groups).length === 0 ? (
          <div className="text-muted-foreground">No data yet</div>
        ) : null}
      </div>
    </div>
  );
}

function groupBy<
  T extends { [k: string]: unknown } & { isCorrect: boolean | null },
>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, { total: number; correct: number; incorrect: number }> {
  const out: Record<
    string,
    { total: number; correct: number; incorrect: number }
  > = {};
  for (const it of items) {
    const key = keyFn(it) || 'Unknown';
    if (!out[key]) {
      out[key] = { total: 0, correct: 0, incorrect: 0 };
    }
    out[key].total += 1;
    if (it.isCorrect === true) {
      out[key].correct += 1;
    }
    if (it.isCorrect === false) {
      out[key].incorrect += 1;
    }
  }
  return out;
}
