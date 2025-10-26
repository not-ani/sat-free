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
import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { QuestionTablesDataClient } from './data';
import { filters } from './filter';
import { Filters } from './filters';

export function QuestionsTableClient() {
  const [results, setQuery] = useQueryStates(filters);

  const {
    program,
    subject,
    domains: selectedDomains,
    difficulties: selectedDifficulties,
    skills: selectedSkills,
    onlyInactive,
  } = results;

  const availableDomains = useMemo<Domain[]>(() => {
    if (!subject) {
      return [...domains];
    }
    return [...subjectToDomains[subject]];
  }, [subject]);

  const availableSkills = useMemo<Skill[]>(() => {
    if (selectedDomains.length === 0) {
      return [...skills];
    }
    const skillsSet = new Set<Skill>();
    for (const domain of selectedDomains) {
      for (const skill of domainToSkills[domain]) {
        skillsSet.add(skill);
      }
    }
    return [...skillsSet];
  }, [selectedDomains]);

  useEffect(() => {
    if (subject && selectedDomains.length > 0) {
      const validDomains = selectedDomains.filter((d) =>
        subjectToDomains[subject].has(d)
      );
      if (validDomains.length !== selectedDomains.length) {
        setQuery({ domains: validDomains, skills: [], page: 1 });
      }
    }
  }, [subject, selectedDomains, setQuery]);

  useEffect(() => {
    if (selectedDomains.length > 0 && selectedSkills.length > 0) {
      const validSkillsSet = new Set<Skill>();
      for (const domain of selectedDomains) {
        for (const skill of domainToSkills[domain]) {
          validSkillsSet.add(skill);
        }
      }
      const validSkills = selectedSkills.filter((s) => validSkillsSet.has(s));
      if (validSkills.length !== selectedSkills.length) {
        setQuery({ skills: validSkills, page: 1 });
      }
    }
  }, [selectedDomains, selectedSkills, setQuery]);

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
        domains: [],
        skills: [],
        page: 1,
      }),
    [setQuery]
  );
  const onDomainsChange = useCallback(
    (values: string[]) =>
      setQuery({
        domains: values as Domain[],
        skills: [],
        page: 1,
      }),
    [setQuery]
  );
  const onDifficultiesChange = useCallback(
    (values: string[]) =>
      setQuery({
        difficulties: values as Difficulty[],
        page: 1,
      }),
    [setQuery]
  );
  const onSkillsChange = useCallback(
    (values: string[]) => setQuery({ skills: values as Skill[], page: 1 }),
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
        availableDomains={availableDomains}
        availableSkills={availableSkills}
        difficulties={selectedDifficulties}
        domains={selectedDomains}
        onDifficultiesChange={onDifficultiesChange}
        onDomainsChange={onDomainsChange}
        onlyInactive={onlyInactive}
        onOnlyInactiveChange={onOnlyInactiveChange}
        onProgramChange={onProgramChange}
        onSkillsChange={onSkillsChange}
        onSubjectChange={onSubjectChange}
        program={program}
        skills={selectedSkills}
        subject={subject}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <QuestionTablesDataClient filters={results} setQuery={setQuery} />
      </Suspense>
    </div>
  );
}
