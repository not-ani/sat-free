'use client';
import { api } from '@convex/_generated/api';
import { useQuery } from 'convex/react';
import Link from 'next/link';

export default function SkillsInsightsPage() {
  const stats = useQuery(api.myFunctions.getMyAttemptStats, {});
  if (!stats) {
    return null;
  }

  const entries = Object.entries(stats.bySkill).sort(
    (a, b) => b[1].total - a[1].total
  );

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="mb-2">
        <h1 className="font-semibold text-2xl">Insights · Skills</h1>
        <p className="text-muted-foreground">
          Breakdown of performance by skill.
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Skill</th>
              <th className="p-3">Attempts</th>
              <th className="p-3">Correct</th>
              <th className="p-3">Accuracy</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {entries.map(([skill, v]) => (
              <tr className="border-t" key={skill}>
                <td className="p-3">{skill}</td>
                <td className="p-3">{v.total}</td>
                <td className="p-3">{v.correct}</td>
                <td className="p-3">
                  {Math.round((v.correct / Math.max(v.total, 1)) * 100)}%
                </td>
                <td className="p-3">
                  <Link
                    className="text-primary underline-offset-4 hover:underline"
                    href={`/insights/skills/${encodeURIComponent(skill)}`}
                  >
                    View attempts
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 ? (
          <div className="p-4 text-muted-foreground text-sm">No data yet</div>
        ) : null}
      </div>
    </div>
  );
}
