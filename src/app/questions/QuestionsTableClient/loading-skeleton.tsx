'use client';

import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Column } from './types';

type LoadingSkeletonProps = {
  columns: Array<Column>;
};

export function LoadingSkeleton({ columns }: LoadingSkeletonProps) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label>Program</Label>
          <div className="h-10 w-[180px] rounded " />
        </div>
        <div className="space-y-1">
          <Label>Subject</Label>
          <div className="h-10 w-[220px] rounded " />
        </div>
        <div className="space-y-1">
          <Label>Domain</Label>
          <div className="h-10 w-[260px] rounded " />
        </div>
        <div className="space-y-1">
          <Label>Difficulty</Label>
          <div className="h-10 w-[160px] rounded " />
        </div>
        <div className="space-y-1">
          <Label>Skill</Label>
          <div className="h-10 w-[360px] rounded " />
        </div>
        <div>
          <div className="h-10 w-16 rounded " />
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border">
        <div className="h-5 w-32 rounded " />
        <div className="h-4 w-24 rounded " />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 20 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-5 animate-pulse rounded " />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-10 w-20 animate-pulse rounded " />
        <div className="h-4 w-16 animate-pulse rounded " />
        <div className="h-10 w-16 animate-pulse rounded " />
      </div>
    </div>
  );
}


