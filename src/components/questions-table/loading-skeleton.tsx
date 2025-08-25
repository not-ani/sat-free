'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Column } from './types';

type LoadingSkeletonProps = {
  columns: Array<Column>;
};

export function LoadingSkeleton({ columns }: LoadingSkeletonProps) {
  return (
    <div className="grid gap-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((_, i) => (
                <TableHead key={i} />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 20 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-5 animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-10 w-20 animate-pulse rounded" />
        <div className="h-4 w-16 animate-pulse rounded" />
        <div className="h-10 w-16 animate-pulse rounded" />
      </div>
    </div>
  );
}
