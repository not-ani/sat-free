'use client';

import {
  type Difficulty,
  type Domain,
  domains,
  domainToSkills,
  type Program,
  type Skill,
  type Subject,
  skills,
  subjectToDomains,
} from '@convex/questionsFilters';
import { useQueryStates } from 'nuqs';
import { useCallback, useEffect, useMemo } from 'react';

import { filters } from './filter';
import { Filters } from './filters';
import { QuestionTablesDataClient } from './data';

export function QuestionsTableClient() {
  const [results, setQuery] = useQueryStates(filters);

  const { program, subject, domain, difficulty, skill, onlyInactive } = results;

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
      <QuestionTablesDataClient filters={results} setQuery={setQuery} />
    </div>
  );
}
