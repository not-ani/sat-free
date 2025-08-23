'use client';
import { api } from '@convex/_generated/api';
import {
  type Difficulty,
  type Domain,
  difficulties,
  domains,
  domainToSkills,
  type Program,
  programs,
  type Skill,
  type Subject,
  skills,
  subjects,
  subjectToDomains,
} from '@convex/questionsFilters';
import { useQuery } from 'convex/react';
import type { FunctionReturnType } from 'convex/server';
import Link from 'next/link';
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs';
import { useEffect, useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Row = FunctionReturnType<typeof api.questions.list>['rows'][number];

export default function QuestionsTableClient() {
  const [
    {
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
      questionId,
    },
    setQuery,
  ] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(20),
    sort: parseAsStringEnum(['updateDate', 'createDate']).withDefault(
      'updateDate'
    ),
    order: parseAsStringEnum(['asc', 'desc']).withDefault('desc'),
    program: parseAsStringEnum([...programs]).withDefault('SAT'),
    subject: parseAsStringEnum([...subjects]),
    domain: parseAsStringEnum([...domains]),
    difficulty: parseAsStringEnum([...difficulties]),
    skill: parseAsStringEnum([...skills]),
    ibnOnly: parseAsBoolean.withDefault(false),
    hasExternalId: parseAsBoolean.withDefault(false),
    questionId: parseAsString.withDefault(''),
  });

  // Use reactive query that responds to URL state changes
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
      questionId: questionId || undefined,
    },
  });

  const [isPending, startTransition] = useTransition();

  const availableDomains = useMemo<Domain[]>(() => {
    if (!subject) {
      return [...domains];
    }
    return [...subjectToDomains[subject]];
  }, [subject]);

  const availableSkills = useMemo<Skill[]>(() => {
    if (!domain) {
      return [...skills];
    }
    return [...domainToSkills[domain]];
  }, [domain]);

  useEffect(() => {
    if (subject && domain && !subjectToDomains[subject].has(domain)) {
      void setQuery({ domain: null, skill: null, page: 1 });
    }
  }, [subject, domain, setQuery]);

  useEffect(() => {
    if (domain && skill && !domainToSkills[domain].has(skill)) {
      void setQuery({ skill: null, page: 1 });
    }
  }, [domain, skill, setQuery]);

  type Column = { header: string; accessor: (row: Row) => React.ReactNode };
  const columns = useMemo<Column[]>(
    () => [
      {
        header: 'Question ID',
        accessor: (row) => (
          <Link
            className="text-blue-600 hover:underline"
            href={`/questions/${encodeURIComponent(row.questionId)}`}
          >
            {row.questionId}
          </Link>
        ),
      },
      { header: 'Program', accessor: (r) => r.program },
      { header: 'Subject', accessor: (r) => r.subject },
      { header: 'Domain', accessor: (r) => r.domain },
      { header: 'Difficulty', accessor: (r) => r.difficulty },
      { header: 'Skill', accessor: (r) => r.skill },
    ],
    []
  );

  const user = useQuery(api.user.getCurrentUser);

  const changePage = (next: number) => {
    startTransition(() => {
      void setQuery({ page: next });
    });
  };

  if (!data) {
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label>Program</Label>
            <div className="h-10 w-[180px] animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-1">
            <Label>Subject</Label>
            <div className="h-10 w-[220px] animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-1">
            <Label>Domain</Label>
            <div className="h-10 w-[260px] animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-1">
            <Label>Difficulty</Label>
            <div className="h-10 w-[160px] animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-1">
            <Label>Skill</Label>
            <div className="h-10 w-[360px] animate-pulse rounded bg-gray-200" />
          </div>
          <div>
            <div className="h-10 w-16 animate-pulse rounded bg-gray-200" />
          </div>
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
                      <div className="h-5 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {user?.name ?? 'no'}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label>Program</Label>
          <Select
            onValueChange={(v: string) =>
              setQuery({
                program: v === '__all' ? null : (v as Program),
                page: 1,
              })
            }
            value={program ?? '__all'}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All</SelectItem>
              {programs.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Subject</Label>
          <Select
            onValueChange={(v: string) =>
              setQuery({
                subject: v === '__all' ? null : (v as Subject),
                domain: null,
                skill: null,
                page: 1,
              })
            }
            value={subject ?? '__all'}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Domain</Label>
          <Select
            onValueChange={(v: string) =>
              setQuery({
                domain: v === '__all' ? null : (v as Domain),
                skill: null,
                page: 1,
              })
            }
            value={domain ?? '__all'}
          >
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All</SelectItem>
              {availableDomains.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Difficulty</Label>
          <Select
            onValueChange={(v: string) =>
              setQuery({
                difficulty: v === '__all' ? null : (v as Difficulty),
                page: 1,
              })
            }
            value={difficulty ?? '__all'}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All</SelectItem>
              {difficulties.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Skill</Label>
          <Select
            onValueChange={(v: string) =>
              setQuery({ skill: v === '__all' ? null : (v as Skill), page: 1 })
            }
            value={skill ?? '__all'}
          >
            <SelectTrigger className="w-[360px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All</SelectItem>
              {availableSkills.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Button
            disabled={isPending}
            onClick={() =>
              setQuery({
                program: null,
                subject: null,
                domain: null,
                difficulty: null,
                skill: null,
                ibnOnly: null,
                hasExternalId: null,
                questionId: null,
                page: 1,
              })
            }
            variant="outline"
          >
            Clear
          </Button>
        </div>
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
            {data?.rows.length ? (
              data.rows.map((r) => (
                <TableRow key={r._id}>
                  {columns.map((col, i) => (
                    <TableCell key={i}>{col.accessor(r)}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <Button
          disabled={isPending || (page ?? 1) <= 1}
          onClick={() => changePage(Math.max(1, (page ?? 1) - 1))}
          variant="outline"
        >
          Previous
        </Button>
        <div className="text-muted-foreground text-sm">Page {page ?? 1}</div>
        <Button
          disabled={isPending || !data?.hasMore}
          onClick={() => changePage((page ?? 1) + 1)}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
