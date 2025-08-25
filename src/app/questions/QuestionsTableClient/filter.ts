import {
  difficulties,
  domains,
  programs,
  skills,
  subjects,
} from '@convex/questionsFilters';
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  type inferParserType,
  parseAsStringEnum,
} from 'nuqs';

export const filters = {
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
};

export type Filters = inferParserType<typeof filters>;
