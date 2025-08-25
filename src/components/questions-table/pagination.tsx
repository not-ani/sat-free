"use client";

import { Button } from '@/components/ui/button';
import { memo } from 'react';

type PaginationProps = {
  page: number | null | undefined;
  isPending: boolean;
  hasMore: boolean | undefined;
  changePage: (next: number) => void;
  rowsLength: number;
  totalLabel: string;
};

function PaginationImpl({
  page,
  isPending,
  hasMore,
  changePage,
  rowsLength,
  totalLabel,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        type="button"
        disabled={isPending || (page ?? 1) <= 1}
        onClick={() => changePage(Math.max(1, (page ?? 1) - 1))}
        variant="outline"
      >
        Previous
      </Button>
      <div className="text-muted-foreground text-sm">
        Page {page ?? 1} of {rowsLength ?? 1} | Total {totalLabel}
      </div>
      <Button
        type="button"
        disabled={isPending || !hasMore}
        onClick={() => changePage((page ?? 1) + 1)}
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
}

export const Pagination = memo(PaginationImpl);


