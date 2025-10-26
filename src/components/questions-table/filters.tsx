'use client';
import type {
  Difficulty,
  Domain,
  Program,
  Skill,
  Subject,
} from '@convex/questionsFilters';
import { difficulties, programs, subjects } from '@convex/questionsFilters';
import { memo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
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
  domains: Domain[];
  difficulties: Difficulty[];
  skills: Skill[];
  availableDomains: Domain[];
  availableSkills: Skill[];
  onlyInactive: boolean | null | undefined;
  onProgramChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onDomainsChange: (values: string[]) => void;
  onDifficultiesChange: (values: string[]) => void;
  onSkillsChange: (values: string[]) => void;
  onOnlyInactiveChange: (checked: boolean | 'indeterminate') => void;
};

function FiltersImpl(props: FiltersProps) {
  const {
    program,
    subject,
    domains,
    difficulties: selectedDifficulties,
    skills: selectedSkills,
    availableDomains,
    availableSkills,
    onlyInactive,
    onProgramChange,
    onSubjectChange,
    onDomainsChange,
    onDifficultiesChange,
    onSkillsChange,
    onOnlyInactiveChange,
  } = props;

  const domainOptions = availableDomains.map((d) => ({
    label: d,
    value: d,
  }));

  const difficultyOptions = difficulties.map((d) => ({
    label: d,
    value: d,
  }));

  const skillOptions = availableSkills.map((s) => ({
    label: s,
    value: s,
  }));

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
        <Label>Domains</Label>
        <MultiSelect
          className="w-[260px]"
          defaultValue={domains}
          onValueChange={onDomainsChange}
          options={domainOptions}
          placeholder="Select domains"
        />
      </div>

      <div className="space-y-1">
        <Label>Difficulties</Label>
        <MultiSelect
          className="w-[200px]"
          defaultValue={selectedDifficulties}
          onValueChange={onDifficultiesChange}
          options={difficultyOptions}
          placeholder="Select difficulties"
        />
      </div>

      <div className="space-y-1">
        <Label>Skills</Label>
        <MultiSelect
          className="w-[360px]"
          defaultValue={selectedSkills}
          onValueChange={onSkillsChange}
          options={skillOptions}
          placeholder="Select skills"
        />
      </div>

      <div className="space-y-1">
        <Label>Exclude Bluebook</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={onlyInactive ?? false}
            className="h-8 w-8 border-muted-foreground"
            id="onlyInactive"
            onCheckedChange={onOnlyInactiveChange}
          />
        </div>
      </div>
    </div>
  );
}

export const Filters = memo(FiltersImpl);
