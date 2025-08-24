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
import Link from 'next/link';
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs';
import { useCallback, useEffect, useMemo, useTransition } from 'react';

import { Filters } from './filters';
import { LoadingSkeleton } from './loading-skeleton';
import { Pagination } from './pagination';
import { TableView } from './table-view';
import type { Column, Row } from './types';

export function QuestionsTableClient() {
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
      onlyInactive,
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
    onlyInactive: parseAsBoolean.withDefault(false),
    questionId: parseAsString.withDefault(''),
  });

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

  // Hoist all handlers so Hooks order stays stable across loading and loaded renders
  const onProgramChange = useCallback(
    (v: string) =>
      setQuery({ program: v === '__all' ? null : (v as Program), page: 1 }),
    [setQuery]
  );
  const onSubjectChange = useCallback(
    (v: string) =>
      setQuery({
        subject: v === '__all' ? null : (v as Subject),
        domain: null,
        skill: null,
        page: 1,
      }),
    [setQuery]
  );
  const onDomainChange = useCallback(
    (v: string) =>
      setQuery({
        domain: v === '__all' ? null : (v as Domain),
        skill: null,
        page: 1,
      }),
    [setQuery]
  );
  const onDifficultyChange = useCallback(
    (v: string) =>
      setQuery({
        difficulty: v === '__all' ? null : (v as Difficulty),
        page: 1,
      }),
    [setQuery]
  );
  const onSkillChange = useCallback(
    (v: string) =>
      setQuery({ skill: v === '__all' ? null : (v as Skill), page: 1 }),
    [setQuery]
  );
  const onOnlyInactiveChange = useCallback(
    (checked: boolean | 'indeterminate') =>
      setQuery({ onlyInactive: checked === true ? true : null, page: 1 }),
    [setQuery]
  );

  if (!data) {
    return <LoadingSkeleton columns={columns} />;
  }

  return (
    <div className="grid gap-4">
      <Filters
        program={program}
        subject={subject}
        domain={domain}
        difficulty={difficulty}
        skill={skill}
        availableDomains={availableDomains}
        availableSkills={availableSkills}
        onlyInactive={onlyInactive}
        onProgramChange={onProgramChange}
        onSubjectChange={onSubjectChange}
        onDomainChange={onDomainChange}
        onDifficultyChange={onDifficultyChange}
        onSkillChange={onSkillChange}
        onOnlyInactiveChange={onOnlyInactiveChange}
      />

      <TableView rows={data.rows} columns={columns} />

      <Pagination
        page={page}
        isPending={isPending}
        hasMore={data?.hasMore}
        changePage={changePage}
        rowsLength={data?.rows.length ?? 0}
        totalLabel={
          totalCount === undefined
            ? '...'
            : totalCount > 100
              ? '100+'
              : String(totalCount)
        }
      />
    </div>
  );
}
