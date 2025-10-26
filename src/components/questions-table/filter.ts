import {
  difficulties,
  domains,
  programs,
  skills,
  subjects,
} from '@convex/questionsFilters';
import {
  type inferParserType,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export const filters = {
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  sort: parseAsStringEnum(['updateDate', 'createDate']).withDefault(
    'updateDate'
  ),
  order: parseAsStringEnum(['asc', 'desc']).withDefault('desc'),
  program: parseAsStringEnum([...programs]).withDefault('SAT'),
  subject: parseAsStringEnum([...subjects]),
  domains: parseAsArrayOf(parseAsStringEnum([...domains])).withDefault([]),
  difficulties: parseAsArrayOf(
    parseAsStringEnum([...difficulties])
  ).withDefault([]),
  skills: parseAsArrayOf(parseAsStringEnum([...skills])).withDefault([]),
  ibnOnly: parseAsBoolean.withDefault(false),
  hasExternalId: parseAsBoolean.withDefault(false),
  onlyInactive: parseAsBoolean.withDefault(false),
  questionId: parseAsString.withDefault(''),
};

export type Filters = inferParserType<typeof filters>;
