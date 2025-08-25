"use client";
import type { Difficulty, Domain, Program, Skill, Subject } from '@convex/questionsFilters';
import { difficulties, programs, subjects } from '@convex/questionsFilters';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FiltersProps = {
  program: Program | null | undefined;
  subject: Subject | null | undefined;
  domain: Domain | null | undefined;
  difficulty: Difficulty | null | undefined;
  skill: Skill | null | undefined;
  availableDomains: Array<Domain>;
  availableSkills: Array<Skill>;
  onlyInactive: boolean | null | undefined;
  onProgramChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onSkillChange: (value: string) => void;
  onOnlyInactiveChange: (checked: boolean | 'indeterminate') => void;
};

import { memo } from 'react';

function FiltersImpl(props: FiltersProps) {
  const {
    program,
    subject,
    domain,
    difficulty,
    skill,
    availableDomains,
    availableSkills,
    onlyInactive,
    onProgramChange,
    onSubjectChange,
    onDomainChange,
    onDifficultyChange,
    onSkillChange,
    onOnlyInactiveChange,
  } = props;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label>Program</Label>
        <Select onValueChange={onProgramChange} value={program ?? '__all'}>
          <SelectTrigger className="w-[180px] border-muted-foreground">
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
        <Select onValueChange={onSubjectChange} value={subject ?? '__all'}>
          <SelectTrigger className="w-[220px] border-muted-foreground">
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
        <Select onValueChange={onDomainChange} value={domain ?? '__all'}>
          <SelectTrigger className="w-[260px] border-muted-foreground">
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
        <Select onValueChange={onDifficultyChange} value={difficulty ?? '__all'}>
          <SelectTrigger className="w-[160px] border-muted-foreground">
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
        <Select onValueChange={onSkillChange} value={skill ?? '__all'}>
          <SelectTrigger className="w-[360px] border-muted-foreground">
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

      <div className="space-y-1">
        <Label>Exclude Bluebook</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="onlyInactive"
            checked={onlyInactive ?? false}
            className="h-8 w-8 border-muted-foreground"
            onCheckedChange={onOnlyInactiveChange}
          />
        </div>
      </div>
    </div>
  );
}

export const Filters = memo(FiltersImpl);


