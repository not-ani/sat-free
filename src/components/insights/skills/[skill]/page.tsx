'use client';
import { api } from '@convex/_generated/api';
import { usePaginatedQuery } from 'convex/react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function SkillDetailPage({
  params,
}: {
  params: { skill: string };
}) {
  const skill = decodeURIComponent(params.skill);
  const { results, loadMore, status } = usePaginatedQuery(
    api.myFunctions.listMyAttemptsBySkillPaginated,
    { skill },
    { initialNumItems: 20 }
  );

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="mb-2">
        <h1 className="font-semibold text-2xl">Skill · {skill}</h1>
        <p className="text-muted-foreground">Your attempts for this skill.</p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Question</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Domain</th>
              <th className="p-3">Result</th>
            </tr>
          </thead>
          <tbody>
            {results.map((a) => (
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
            className="rounded-md border px-3 py-1.5 text-sm"
            disabled={status === 'LoadingMore'}
            onClick={() => loadMore(20)}
            type="button"
          >
            {status === 'LoadingMore' ? 'Loading…' : 'Load more'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
