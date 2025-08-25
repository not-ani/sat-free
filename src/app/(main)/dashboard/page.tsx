'use client';
import { api } from '@convex/_generated/api';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = useQuery(api.myFunctions.getMyAttemptStats, {});
  const { results: attempts, loadMore, status } = usePaginatedQuery(
    api.myFunctions.listMyAttemptsPaginated,
    {},
    { initialNumItems: 20 }
  );

  if (!stats) return null;

  const { totals, bySubject, byDomain, bySkill } = stats;

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="mb-2">
        <h1 className="font-semibold text-2xl">Your Dashboard</h1>
        <p className="text-muted-foreground">Track your question progress.</p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Attempted" value={totals.total} />
        <StatCard label="Correct" value={totals.correct} />
        <StatCard label="Incorrect" value={totals.incorrect} />
        <StatCard label="Accuracy" value={`${totals.accuracy}%`} />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <BreakdownCard groups={bySubject} title="By Subject" />
        <BreakdownCard groups={byDomain} title="By Domain" viewAllHref="/insights/domains" />
        <BreakdownCard groups={bySkill} title="By Skill" viewAllHref="/insights/skills" />
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
        <div className="pt-3">
          {status !== 'Exhausted' ? (
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm"
              onClick={() => loadMore(20)}
              disabled={status === 'LoadingMore'}
            >
              {status === 'LoadingMore' ? 'Loading…' : 'Load more'}
            </button>
          ) : null}
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
  viewAllHref,
}: {
  title: string;
  groups: Record<string, { total: number; correct: number; incorrect: number }>;
  viewAllHref?: string;
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
      {viewAllHref ? (
        <div className="pt-3">
          <Link
            href={viewAllHref}
            className="text-primary underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
      ) : null}
    </div>
  );
}

// groupBy utility moved to server via getMyAttemptStats
