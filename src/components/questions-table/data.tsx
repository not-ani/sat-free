import { api } from '@convex/_generated/api';
import { useQuery } from 'convex/react';
import Link from 'next/link';
import { useCallback, useMemo, useTransition } from 'react';
import type { Filters } from './filter';
import { LoadingSkeleton } from './loading-skeleton';
import { Pagination } from './pagination';
import { TableView } from './table-view';
import type { Column, Row } from './types';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE = 1;
const MAX_COUNT_THRESHOLD = 100;

type SetQueryFn = (query: Partial<Filters>) => void;

function appendArrayParams(qs: URLSearchParams, key: string, values: string[]) {
  for (const value of values) {
    qs.append(key, value);
  }
}

function setBooleanParam(
  qs: URLSearchParams,
  key: string,
  value: boolean | null | undefined
) {
  if (value) {
    qs.set(key, '1');
  }
}

export function QuestionTablesDataClient({
  filters,
  setQuery,
}: {
  filters: Filters;
  setQuery: SetQueryFn;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    page,
    pageSize,
    sort,
    order,
    program,
    subject,
    domains,
    difficulties,
    skills,
    ibnOnly,
    hasExternalId,
    onlyInactive,
    questionId,
  } = filters;
  const queryFilters = useMemo(
    () => ({
      program: program ?? undefined,
      subject: subject ?? undefined,
      domains: domains.length > 0 ? domains : undefined,
      difficulties: difficulties.length > 0 ? difficulties : undefined,
      skills: skills.length > 0 ? skills : undefined,
      ibnOnly: ibnOnly ?? undefined,
      hasExternalId: hasExternalId ?? undefined,
      onlyInactive: onlyInactive ?? undefined,
      questionId: questionId || undefined,
    }),
    [
      program,
      subject,
      domains,
      difficulties,
      skills,
      ibnOnly,
      hasExternalId,
      onlyInactive,
      questionId,
    ]
  );

  const currentPage = page ?? DEFAULT_PAGE;
  const currentPageSize = pageSize ?? DEFAULT_PAGE_SIZE;

  const data = useQuery(api.questions.list, {
    page: currentPage,
    pageSize: currentPageSize,
    sort: sort ?? 'updateDate',
    order: order ?? 'desc',
    filters: queryFilters,
  });

  // Prefetch adjacent pages for snappy navigation
  const _prefetchNext = useQuery(api.questions.list, {
    page: currentPage + 1,
    pageSize: currentPageSize,
    sort: sort ?? 'updateDate',
    order: order ?? 'desc',
    filters: queryFilters,
  });

  const _prefetchPrev = useQuery(api.questions.list, {
    page: Math.max(DEFAULT_PAGE, currentPage - 1),
    pageSize: currentPageSize,
    sort: sort ?? 'updateDate',
    order: order ?? 'desc',
    filters: queryFilters,
  });

  const totalCount = useQuery(api.questions.count, {
    filters: queryFilters,
  });

  const baseQueryString = useMemo(() => {
    const qs = new URLSearchParams();

    // Set pagination and sorting params
    qs.set('page', String(currentPage));
    qs.set('pageSize', String(currentPageSize));
    qs.set('sort', String(sort ?? 'updateDate'));
    qs.set('order', String(order ?? 'desc'));

    // Set filter params
    if (program) {
      qs.set('program', program);
    }
    if (subject) {
      qs.set('subject', subject);
    }

    // Append array params
    appendArrayParams(qs, 'domains', domains);
    appendArrayParams(qs, 'difficulties', difficulties);
    appendArrayParams(qs, 'skills', skills);

    // Set boolean flags
    setBooleanParam(qs, 'ibnOnly', ibnOnly);
    setBooleanParam(qs, 'hasExternalId', hasExternalId);
    setBooleanParam(qs, 'onlyInactive', onlyInactive);

    return qs.toString();
  }, [
    currentPage,
    currentPageSize,
    sort,
    order,
    program,
    subject,
    domains,
    difficulties,
    skills,
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
        setQuery({ page: next });
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
            : totalCount > MAX_COUNT_THRESHOLD
              ? '100+'
              : String(totalCount)
        }
      />
    </>
  );
}
