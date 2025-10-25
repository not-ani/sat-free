'use client';
import { api } from '@convex/_generated/api';
import type {
  Difficulty,
  Domain,
  Program,
  Skill,
  Subject,
} from '@convex/questionsFilters';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';

const DEFAULT_PAGE_SIZE = 20;

const questionNavigatorParser = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  sort: parseAsStringLiteral(['updateDate', 'createDate'] as const).withDefault(
    'updateDate'
  ),
  order: parseAsStringLiteral(['asc', 'desc'] as const).withDefault('desc'),
  program: parseAsString,
  subject: parseAsString,
  domain: parseAsString,
  difficulty: parseAsString,
  skill: parseAsString,
  ibnOnly: parseAsBoolean,
  hasExternalId: parseAsBoolean,
  onlyInactive: parseAsBoolean,
  row: parseAsInteger.withDefault(0),
};

export const useQuestionNavigator = () => {
  const [params] = useQueryStates(questionNavigatorParser, {
    shallow: false,
  });

  return useMemo(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      order: params.order,
      program: params.program ?? undefined,
      subject: params.subject ?? undefined,
      domain: params.domain ?? undefined,
      difficulty: params.difficulty ?? undefined,
      skill: params.skill ?? undefined,
      ibnOnly: params.ibnOnly ?? undefined,
      hasExternalId: params.hasExternalId ?? undefined,
      onlyInactive: params.onlyInactive ?? undefined,
      rowIndex: params.row,
    }),
    [params]
  );
};

const findQuestionIndex = (
  rows: Array<{ questionId: string }>,
  currentQuestionId: string,
  fallbackRowIndex: number
): number => {
  const index = rows.findIndex((r) => r.questionId === currentQuestionId);
  return index >= 0
    ? index
    : Math.max(0, Math.min(fallbackRowIndex, rows.length - 1));
};

const getPrevQuestionId = (
  rows: Array<{ questionId?: string }>,
  index: number,
  currentPage: number,
  prevPageData: { rows?: Array<{ questionId?: string }> } | undefined
): string | null => {
  const hasPrevInPage = index > 0;
  if (hasPrevInPage) {
    return rows[index - 1]?.questionId ?? null;
  }

  const canLoadPrevPage =
    currentPage > 1 && Boolean(prevPageData?.rows?.length);
  if (canLoadPrevPage && prevPageData) {
    return prevPageData.rows?.at(-1)?.questionId ?? null;
  }

  return null;
};

const getNextQuestionId = (
  rows: Array<{ questionId?: string }>,
  index: number,
  hasMore: boolean,
  nextPageData: { rows?: Array<{ questionId?: string }> } | undefined
): string | null => {
  const hasNextInPage = index + 1 < rows.length;
  if (hasNextInPage) {
    return rows[index + 1]?.questionId ?? null;
  }

  const canLoadNextPage = hasMore && Boolean(nextPageData?.rows?.length);
  if (canLoadNextPage && nextPageData) {
    return nextPageData.rows?.[0]?.questionId ?? null;
  }

  return null;
};

export function QuestionNavigator({
  currentQuestionId,
}: {
  currentQuestionId: string;
}) {
  const params = useQuestionNavigator();
  const [, setParams] = useQueryStates(questionNavigatorParser, {
    shallow: false,
  });
  const router = useRouter();

  const filters = useMemo(
    () => ({
      program: params.program as Program,
      subject: params.subject as Subject,
      domain: params.domain as Domain,
      difficulty: params.difficulty as Difficulty,
      skill: params.skill as Skill,
      ibnOnly: params.ibnOnly,
      hasExternalId: params.hasExternalId,
      onlyInactive: params.onlyInactive,
    }),
    [
      params.program,
      params.subject,
      params.domain,
      params.difficulty,
      params.skill,
      params.ibnOnly,
      params.hasExternalId,
      params.onlyInactive,
    ]
  );

  const currentPage = params.page > 0 ? params.page : 1;
  const currentPageSize =
    params.pageSize > 0 ? params.pageSize : DEFAULT_PAGE_SIZE;

  const data = useQuery(api.questions.list, {
    page: currentPage,
    pageSize: currentPageSize,
    sort: params.sort,
    order: params.order,
    filters,
  });

  const prevPageData = useQuery(api.questions.list, {
    page: Math.max(1, currentPage - 1),
    pageSize: currentPageSize,
    sort: params.sort,
    order: params.order,
    filters,
  });

  const nextPageData = useQuery(api.questions.list, {
    page: currentPage + 1,
    pageSize: currentPageSize,
    sort: params.sort,
    order: params.order,
    filters,
  });

  const totalCount = useQuery(api.questions.count, { filters });

  const nav = useMemo(() => {
    const defaultNav = {
      index: 0,
      count: 0,
      prev: null as string | null,
      next: null as string | null,
      absoluteIndex: 0,
      total: 0,
    };

    if (!data?.rows) {
      return defaultNav;
    }

    const { rows } = data;
    const index = findQuestionIndex(rows, currentQuestionId, params.rowIndex);
    const prevId = getPrevQuestionId(rows, index, currentPage, prevPageData);
    const nextId = getNextQuestionId(rows, index, data.hasMore, nextPageData);
    const absoluteIndex = (currentPage - 1) * currentPageSize + index;

    return {
      index,
      count: rows.length,
      prev: prevId,
      next: nextId,
      absoluteIndex,
      total: totalCount ?? rows.length,
    };
  }, [
    data,
    params.rowIndex,
    currentQuestionId,
    currentPage,
    currentPageSize,
    prevPageData,
    nextPageData,
    totalCount,
  ]);

  const navigateToPrev = useCallback(async () => {
    if (!nav.prev) {
      return;
    }

    const isInCurrentPage = nav.index > 0;
    if (isInCurrentPage) {
      await setParams({ row: nav.index - 1 });
    } else {
      const prevRowCount = prevPageData?.rows?.length ?? 1;
      await setParams({
        page: currentPage - 1,
        row: prevRowCount - 1,
      });
    }
    router.push(`/questions/${encodeURIComponent(nav.prev)}`);
  }, [nav, currentPage, prevPageData, setParams, router]);

  const navigateToNext = useCallback(async () => {
    if (!nav.next) {
      return;
    }

    const isInCurrentPage = nav.index + 1 < nav.count;
    if (isInCurrentPage) {
      await setParams({ row: nav.index + 1 });
    } else {
      await setParams({ page: currentPage + 1, row: 0 });
    }
    router.push(`/questions/${encodeURIComponent(nav.next)}`);
  }, [nav, currentPage, setParams, router]);

  const goBack = useCallback(async () => {
    await setParams({ row: null });
    router.push('/');
  }, [setParams, router]);

  const canNavigatePrev = Boolean(data && nav.prev);
  const canNavigateNext = Boolean(data && nav.next);

  const displayPosition =
    data && typeof totalCount === 'number' && nav.count > 0
      ? `${nav.absoluteIndex + 1}/${totalCount}`
      : '—';

  return (
    <div className="mt-6 flex items-center justify-between gap-2">
      <Button
        disabled={!canNavigatePrev}
        onClick={navigateToPrev}
        type="button"
        variant="outline"
      >
        Previous
      </Button>
      <div className="flex items-center gap-3">
        <Button onClick={goBack} type="button" variant="ghost">
          Back to results
        </Button>
        <span className="text-muted-foreground text-sm">{displayPosition}</span>
      </div>
      <Button
        disabled={!canNavigateNext}
        onClick={navigateToNext}
        type="button"
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
}
