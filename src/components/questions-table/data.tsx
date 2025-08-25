import { api } from '@convex/_generated/api';
import { useQuery } from 'convex/react';
import Link from 'next/link';
import { useCallback, useMemo, useTransition } from 'react';
import type { Filters } from './filter';
import { LoadingSkeleton } from './loading-skeleton';
import { Pagination } from './pagination';
import { TableView } from './table-view';
import type { Column, Row } from './types';

export function QuestionTablesDataClient({
  filters,
  setQuery,
}: {
  filters: Filters;
  setQuery: (query: any) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    page,
    pageSize,
    sort,
    order,
    program,
    subject,
    domain,
    difficulty,
    skill,
    ibnOnly,
    hasExternalId,
    onlyInactive,
    questionId,
  } = filters;
  const data = useQuery(api.questions.list, {
    page: page ?? 1,
    pageSize: pageSize ?? 20,
    sort: sort ?? 'updateDate',
    order: order ?? 'desc',
    filters: {
      program: program ?? undefined,
      subject: subject ?? undefined,
      domain: domain ?? undefined,
      difficulty: difficulty ?? undefined,
      skill: skill ?? undefined,
      ibnOnly: ibnOnly ?? undefined,
      hasExternalId: hasExternalId ?? undefined,
      onlyInactive: onlyInactive ?? undefined,
      questionId: questionId || undefined,
    },
  });
  const totalCount = useQuery(api.questions.count, {
    filters: {
      program: program ?? undefined,
      subject: subject ?? undefined,
      domain: domain ?? undefined,
      difficulty: difficulty ?? undefined,
      skill: skill ?? undefined,
      ibnOnly: ibnOnly ?? undefined,
      hasExternalId: hasExternalId ?? undefined,
      onlyInactive: onlyInactive ?? undefined,
      questionId: questionId || undefined,
    },
  });

  const baseQueryString = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set('page', String(page ?? 1));
    qs.set('pageSize', String(pageSize ?? 20));
    qs.set('sort', String(sort ?? 'updateDate'));
    qs.set('order', String(order ?? 'desc'));
    if (program) qs.set('program', program);
    if (subject) qs.set('subject', subject);
    if (domain) qs.set('domain', domain);
    if (difficulty) qs.set('difficulty', difficulty);
    if (skill) qs.set('skill', skill);
    if (ibnOnly) qs.set('ibnOnly', '1');
    if (hasExternalId) qs.set('hasExternalId', '1');
    if (onlyInactive) qs.set('onlyInactive', '1');
    return qs.toString();
  }, [
    page,
    pageSize,
    sort,
    order,
    program,
    subject,
    domain,
    difficulty,
    skill,
    ibnOnly,
    hasExternalId,
    onlyInactive,
  ]);
  const columns = useMemo<Column[]>(
    () => [
      {
        header: 'Question ID',
        accessor: (row: Row, rowIndex: number) => (
          <Link
            className="text-primary hover:underline"
            href={`/questions/${encodeURIComponent(row.questionId)}?${baseQueryString}&row=${rowIndex}`}
          >
            {row.questionId}
          </Link>
        ),
      },
      { header: 'Subject', accessor: (r) => r.subject },
      { header: 'Domain', accessor: (r) => r.domain },
      { header: 'Difficulty', accessor: (r) => r.difficulty },
      { header: 'Skill', accessor: (r) => r.skill },
    ],
    [baseQueryString]
  );

  const changePage = useCallback(
    (next: number) => {
      startTransition(() => {
        void setQuery({ page: next });
      });
    },
    [setQuery]
  );

  if (!data) {
    return <LoadingSkeleton columns={columns} />;
  }

  return (
    <>
      <TableView columns={columns} rows={data.rows} />

      <Pagination
        changePage={changePage}
        hasMore={data?.hasMore}
        isPending={isPending}
        page={page}
        rowsLength={data?.rows.length ?? 0}
        totalLabel={
          totalCount === undefined
            ? '...'
            : totalCount > 100
              ? '100+'
              : String(totalCount)
        }
      />
    </>
  );
}
