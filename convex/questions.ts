import { v } from 'convex/values';
import type { QueryCtx } from './_generated/server';
import { query } from './_generated/server';
import {
  type Difficulty,
  type Domain,
  difficulty,
  difficultyArray,
  domain,
  domainArray,
  type Program,
  program as programValidator,
  type Skill,
  type Subject,
  skill,
  skillArray,
  subject,
} from './questionsFilters';

const DEFAULT_PAGE_SIZE = 20;

type Filters = {
  program?: Program;
  subject?: Subject;
  domain?: Domain;
  domains?: Domain[];
  difficulty?: Difficulty;
  difficulties?: Difficulty[];
  skill?: Skill;
  skills?: Skill[];
  ibnOnly?: boolean;
  hasExternalId?: boolean;
  onlyInactive?: boolean;
  questionId?: string;
};

async function handleQuestionIdLookup(
  ctx: QueryCtx,
  filters: Filters,
  questionId: string
) {
  const doc = await ctx.db
    .query('questions')
    .withIndex('by_questionId', (q) => q.eq('questionId', questionId))
    .unique();
  if (!doc) {
    return null;
  }

  // Apply remaining filters in-memory to avoid returning mismatched records
  if (
    (filters.program && doc.program !== filters.program) ||
    (filters.subject && doc.subject !== filters.subject) ||
    (filters.domain && doc.domain !== filters.domain) ||
    (filters.domains &&
      filters.domains.length > 0 &&
      !filters.domains.includes(doc.domain)) ||
    (filters.difficulty && doc.difficulty !== filters.difficulty) ||
    (filters.difficulties &&
      filters.difficulties.length > 0 &&
      !filters.difficulties.includes(doc.difficulty)) ||
    (filters.skill && doc.skill !== filters.skill) ||
    (filters.skills &&
      filters.skills.length > 0 &&
      !filters.skills.includes(doc.skill)) ||
    (filters.onlyInactive && doc.isActive !== false) ||
    (filters.hasExternalId && doc.external_id === null) ||
    (filters.ibnOnly && doc.ibn === null)
  ) {
    return null;
  }

  return doc;
}

function buildBaseQuery(ctx: QueryCtx, filters: Filters) {
  // For single-value filters, use indexes if available
  // Array filters will be handled in applyFilters
  if (filters.skill && !filters.skills) {
    const skillValue = filters.skill;
    return ctx.db
      .query('questions')
      .withIndex('by_skill', (q) => q.eq('skill', skillValue));
  }
  if (filters.domain && !filters.domains) {
    const domainValue = filters.domain;
    return ctx.db
      .query('questions')
      .withIndex('by_domain', (q) => q.eq('domain', domainValue));
  }
  if (filters.difficulty && !filters.difficulties) {
    const difficultyValue = filters.difficulty;
    return ctx.db
      .query('questions')
      .withIndex('by_difficulty', (q) => q.eq('difficulty', difficultyValue));
  }
  if (filters.subject) {
    const subjectValue = filters.subject;
    return ctx.db
      .query('questions')
      .withIndex('by_subject', (q) => q.eq('subject', subjectValue));
  }
  return ctx.db.query('questions');
}

function applyFilters(
  baseQuery: ReturnType<typeof buildBaseQuery>,
  filters: Filters
) {
  let filteredQuery = baseQuery;
  if (filters.subject) {
    const subjectValue = filters.subject;
    filteredQuery = filteredQuery.filter((q) =>
      q.eq(q.field('subject'), subjectValue)
    );
  }
  if (filters.domain) {
    const domainValue = filters.domain;
    filteredQuery = filteredQuery.filter((q) =>
      q.eq(q.field('domain'), domainValue)
    );
  }
  if (filters.domains && filters.domains.length > 0) {
    const domainValues = filters.domains;
    filteredQuery = filteredQuery.filter((q) =>
      q.or(...domainValues.map((d) => q.eq(q.field('domain'), d)))
    );
  }
  if (filters.difficulty) {
    const difficultyValue = filters.difficulty;
    filteredQuery = filteredQuery.filter((q) =>
      q.eq(q.field('difficulty'), difficultyValue)
    );
  }
  if (filters.difficulties && filters.difficulties.length > 0) {
    const difficultyValues = filters.difficulties;
    filteredQuery = filteredQuery.filter((q) =>
      q.or(...difficultyValues.map((d) => q.eq(q.field('difficulty'), d)))
    );
  }
  if (filters.skill) {
    const skillValue = filters.skill;
    filteredQuery = filteredQuery.filter((q) =>
      q.eq(q.field('skill'), skillValue)
    );
  }
  if (filters.skills && filters.skills.length > 0) {
    const skillValues = filters.skills;
    filteredQuery = filteredQuery.filter((q) =>
      q.or(...skillValues.map((s) => q.eq(q.field('skill'), s)))
    );
  }
  if (filters.program) {
    const programValue = filters.program;
    filteredQuery = filteredQuery.filter((q) =>
      q.eq(q.field('program'), programValue)
    );
  }
  if (filters.ibnOnly) {
    filteredQuery = filteredQuery.filter((q) => q.neq(q.field('ibn'), null));
  }
  if (filters.hasExternalId) {
    filteredQuery = filteredQuery.filter((q) =>
      q.neq(q.field('external_id'), null)
    );
  }
  if (filters.onlyInactive) {
    filteredQuery = filteredQuery.filter((q) =>
      q.eq(q.field('isActive'), false)
    );
  }
  return filteredQuery;
}

export const list = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    sort: v.optional(v.union(v.literal('updateDate'), v.literal('createDate'))),
    order: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
    filters: v.optional(
      v.object({
        program: v.optional(programValidator),
        subject: v.optional(subject),
        domain: v.optional(domain),
        domains: v.optional(domainArray),
        difficulty: v.optional(difficulty),
        difficulties: v.optional(difficultyArray),
        skill: v.optional(skill),
        skills: v.optional(skillArray),
        ibnOnly: v.optional(v.boolean()),
        hasExternalId: v.optional(v.boolean()),
        onlyInactive: v.optional(v.boolean()),
        questionId: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? DEFAULT_PAGE_SIZE;
    const order = args.order ?? 'desc';
    const filters = args.filters ?? {};

    // Fast path: direct lookup by questionId
    if (filters.questionId) {
      const doc = await handleQuestionIdLookup(
        ctx,
        filters,
        filters.questionId
      );
      if (!doc) {
        return { rows: [], hasMore: false };
      }

      const rows = [
        {
          _id: doc._id,
          questionId: doc.questionId,
          program: doc.program,
          ibn: doc.ibn,
          external_id: doc.external_id,
          createDate: doc.createDate,
          updateDate: doc.updateDate,
          subject: doc.subject,
          domain: doc.domain,
          difficulty: doc.difficulty,
          skill: doc.skill,
          isActive: doc.isActive,
        },
      ];
      return { rows, hasMore: false };
    }

    const baseQuery = buildBaseQuery(ctx, filters);
    const filteredQuery = applyFilters(baseQuery, filters);

    const orderedQuery =
      order === 'asc'
        ? filteredQuery.order('asc')
        : filteredQuery.order('desc');
    const items = await orderedQuery.take(pageSize * page + 1);

    // Slice to get current page
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const rows = items.slice(startIndex, endIndex).map((item) => ({
      _id: item._id,
      questionId: item.questionId,
      program: item.program,
      ibn: item.ibn,
      external_id: item.external_id,
      createDate: item.createDate,
      updateDate: item.updateDate,
      subject: item.subject,
      domain: item.domain,
      difficulty: item.difficulty,
      skill: item.skill,
      isActive: item.isActive,
    }));

    // Check if there are more pages
    const hasMore = items.length > endIndex;

    return {
      rows,
      hasMore,
    };
  },
});

export const count = query({
  args: {
    filters: v.optional(
      v.object({
        program: v.optional(programValidator),
        subject: v.optional(subject),
        domain: v.optional(domain),
        domains: v.optional(domainArray),
        difficulty: v.optional(difficulty),
        difficulties: v.optional(difficultyArray),
        skill: v.optional(skill),
        skills: v.optional(skillArray),
        ibnOnly: v.optional(v.boolean()),
        hasExternalId: v.optional(v.boolean()),
        onlyInactive: v.optional(v.boolean()),
        questionId: v.optional(v.string()),
      })
    ),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const filters = args.filters ?? {};
    const CAP = 100;

    // Fast path: direct count by questionId
    if (filters.questionId) {
      const doc = await handleQuestionIdLookup(
        ctx,
        filters,
        filters.questionId
      );
      return doc ? 1 : 0;
    }

    const baseQuery = buildBaseQuery(ctx, filters);
    const filteredQuery = applyFilters(baseQuery, filters);

    // Single paginated read (Convex allows at most one paginate per function)
    const { page, isDone } = await filteredQuery.paginate({
      numItems: CAP + 1,
      cursor: null,
    });
    if (!isDone) {
      return CAP + 1;
    }
    return page.length;
  },
});

export const getByQuestionId = query({
  args: { questionId: v.string() },

  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query('questions')
      .withIndex('by_questionId', (q) => q.eq('questionId', args.questionId))
      .unique();
    if (!doc) {
      return null;
    }

    const questionData = await ctx.db
      .query('questions_data')
      .withIndex('by_questionId', (q) => q.eq('questionId', doc._id))
      .unique();
    if (!questionData) {
      return null;
    }

    return {
      _id: doc._id,
      questionId: doc.questionId,
      program: doc.program,
      subject: doc.subject,
      domain: doc.domain,
      difficulty: doc.difficulty,
      skill: doc.skill,
      ibn: doc.ibn,
      external_id: doc.external_id,
      createDate: doc.createDate,
      question_data: questionData.question_data,
      updateDate: doc.updateDate,
    };
  },
});
