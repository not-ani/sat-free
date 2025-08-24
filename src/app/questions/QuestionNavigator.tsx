'use client';
import { api } from '@convex/_generated/api';
import { useQuery } from 'convex/react';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function QuestionNavigator({
  currentQuestionId,
}: {
  currentQuestionId: string;
}) {
  const search = useSearchParams();
  const router = useRouter();

  const page = Number(search.get('page') ?? '1');
  const pageSize = Number(search.get('pageSize') ?? '20');
  const sort = (search.get('sort') ?? 'updateDate') as 'updateDate' | 'createDate';
  const order = (search.get('order') ?? 'desc') as 'asc' | 'desc';
  const program = search.get('program') ?? undefined;
  const subject = search.get('subject') ?? undefined;
  const domain = search.get('domain') ?? undefined;
  const difficulty = search.get('difficulty') ?? undefined;
  const skill = search.get('skill') ?? undefined;
  const ibnOnly = search.get('ibnOnly') === '1' ? true : undefined;
  const hasExternalId = search.get('hasExternalId') === '1' ? true : undefined;
  const onlyInactive = search.get('onlyInactive') === '1' ? true : undefined;

  const rowIndex = Number(search.get('row') ?? '0');

  const data = useQuery(api.questions.list, {
    page: isFinite(page) && page > 0 ? page : 1,
    pageSize: isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
    sort,
    order,
    filters: {
      program,
      subject: subject as any,
      domain: domain as any,
      difficulty: difficulty as any,
      skill: skill as any,
      ibnOnly,
      hasExternalId,
      onlyInactive,
    },
  });

  // Prefetch adjacent pages to enable cross-page navigation
  const nextPageData = useQuery(api.questions.list, {
    page: (isFinite(page) && page > 0 ? page : 1) + 1,
    pageSize: isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
    sort,
    order,
    filters: {
      program,
      subject: subject as any,
      domain: domain as any,
      difficulty: difficulty as any,
      skill: skill as any,
      ibnOnly,
      hasExternalId,
      onlyInactive,
    },
  });

  const prevPageData = useQuery(api.questions.list, {
    page: Math.max(1, (isFinite(page) && page > 0 ? page : 1) - 1),
    pageSize: isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
    sort,
    order,
    filters: {
      program,
      subject: subject as any,
      domain: domain as any,
      difficulty: difficulty as any,
      skill: skill as any,
      ibnOnly,
      hasExternalId,
      onlyInactive,
    },
  });

  // Get total count to show absolute position across the whole result set
  const totalCount = useQuery(api.questions.count, {
    filters: {
      program,
      subject: subject as any,
      domain: domain as any,
      difficulty: difficulty as any,
      skill: skill as any,
      ibnOnly,
      hasExternalId,
      onlyInactive,
    },
  });

  const nav = useMemo(() => {
    if (!data) {
      return {
        index: 0,
        count: 0,
        prev: null as string | null,
        next: null as string | null,
        onlyInactive: false,
        absoluteIndex: 0,
        total: 0,
      };
    }
    const rows = data.rows;
    let index = rows.findIndex((r) => r.questionId === currentQuestionId);
    if (index < 0) {
      index = Math.max(0, Math.min(rowIndex, rows.length - 1));
    }
    let prevId: string | null = null;
    if (index - 1 >= 0) {
      prevId = rows[index - 1]?.questionId ?? null;
    } else if ((isFinite(page) && page > 1) && prevPageData?.rows?.length) {
      prevId = prevPageData.rows[prevPageData.rows.length - 1]?.questionId ?? null;
    }
    let nextId: string | null = null;
    if (index + 1 < rows.length) {
      nextId = rows[index + 1]?.questionId ?? null;
    } else if (data.hasMore && nextPageData?.rows?.length) {
      nextId = nextPageData.rows[0]?.questionId ?? null;
    }
    const absoluteIndex = Math.max(0, ((isFinite(page) && page > 0 ? page : 1) - 1) * (isFinite(pageSize) && pageSize > 0 ? pageSize : 20) + index);
    const total = totalCount ?? rows.length;
    return { index, count: rows.length, prev: prevId, next: nextId, onlyInactive: rows[index]?.isActive === false, absoluteIndex, total };
  }, [data, rowIndex, currentQuestionId, page, pageSize, prevPageData, nextPageData, totalCount]);

  const baseQS = useMemo(() => {
    const qs = new URLSearchParams(search.toString());
    // Remove the questionId from potential sharer-added params
    qs.delete('questionId');
    return qs;
  }, [search]);

  const goTo = (dir: 'prev' | 'next') => {
    const currPage = isFinite(page) && page > 0 ? page : 1;
    const currPageSize = isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
    if (dir === 'prev') {
      if (nav.index > 0 && nav.prev) {
        const nextQs = new URLSearchParams(baseQS.toString());
        nextQs.set('row', String(Math.max(0, nav.index - 1)));
        router.push(`/questions/${encodeURIComponent(nav.prev)}?${nextQs.toString()}`);
        return;
      }
      if (nav.index === 0 && currPage > 1 && prevPageData?.rows?.length) {
        const prevId = prevPageData.rows[prevPageData.rows.length - 1]?.questionId;
        if (prevId) {
          const nextQs = new URLSearchParams(baseQS.toString());
          nextQs.set('page', String(currPage - 1));
          nextQs.set('row', String(Math.max(0, prevPageData.rows.length - 1)));
          router.push(`/questions/${encodeURIComponent(prevId)}?${nextQs.toString()}`);
          return;
        }
      }
    }
    if (dir === 'next') {
      if (nav.index + 1 < (data?.rows.length ?? 0) && nav.next) {
        const nextQs = new URLSearchParams(baseQS.toString());
        nextQs.set('row', String(nav.index + 1));
        router.push(`/questions/${encodeURIComponent(nav.next)}?${nextQs.toString()}`);
        return;
      }
      if (nav.index + 1 >= (data?.rows.length ?? 0) && data?.hasMore && nextPageData?.rows?.length) {
        const nextId = nextPageData.rows[0]?.questionId;
        if (nextId) {
          const nextQs = new URLSearchParams(baseQS.toString());
          nextQs.set('page', String(currPage + 1));
          nextQs.set('row', '0');
          router.push(`/questions/${encodeURIComponent(nextId)}?${nextQs.toString()}`);
          return;
        }
      }
    }
  };

  const goBack = () => {
    // Back to results on the main list, preserving filters
    const qs = new URLSearchParams(baseQS.toString());
    qs.delete('row');
    router.push(`/${qs.toString() ? '?' + qs.toString() : ''}`);
  };

  // Disable while loading or at edges
  const disablePrev = !data || (!nav.prev && !(nav.index === 0 && (isFinite(page) && page > 1)));
  const disableNext = !data || (!nav.next && !(nav.index + 1 >= (data?.rows.length ?? 0) && data?.hasMore));

  return (
    <div className="mt-6 flex items-center justify-between gap-2">
      <Button type="button" variant="outline" disabled={disablePrev} onClick={() => goTo('prev')}>
        Previous
      </Button>
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" onClick={goBack}>
          Back to results
        </Button>
        <span className="text-muted-foreground text-sm">
          {data && typeof totalCount === 'number' && nav.count > 0
            ? `${nav.absoluteIndex + 1}/${totalCount}`
            : '—'}
        </span>
      </div>
      <Button type="button" variant="outline" disabled={disableNext} onClick={() => goTo('next')}>
        Next
      </Button>
    </div>
  );
}


