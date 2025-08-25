import { v } from 'convex/values';
import { query } from './_generated/server';
import {
  difficulty,
  domain,
  program as programValidator,
  skill,
  subject,
} from './questionsFilters';

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
        difficulty: v.optional(difficulty),
        skill: v.optional(skill),
        ibnOnly: v.optional(v.boolean()),
        hasExternalId: v.optional(v.boolean()),
        onlyInactive: v.optional(v.boolean()),
        questionId: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;
    const order = args.order ?? 'desc';
    const filters = args.filters ?? {};
    // Fast path: direct lookup by questionId
    if (filters.questionId) {
      const doc = await ctx.db
        .query('questions')
        .withIndex('by_questionId', (q) =>
          q.eq('questionId', filters.questionId!)
        )
        .unique();
      if (!doc) {
        return { rows: [], hasMore: false };
      }

      // Apply remaining filters in-memory to avoid returning mismatched records
      if (
        (filters.program && doc.program !== filters.program) ||
        (filters.subject && doc.subject !== filters.subject) ||
        (filters.domain && doc.domain !== filters.domain) ||
        (filters.difficulty && doc.difficulty !== filters.difficulty) ||
        (filters.skill && doc.skill !== filters.skill) ||
        (filters.onlyInactive && doc.isActive !== false) ||
        (filters.hasExternalId && doc.external_id === null) ||
        (filters.ibnOnly && doc.ibn === null)
      ) {
        return { rows: [], hasMore: false };
      }

      const rows = [
        {
          _id: doc._id,
          questionId: doc.questionId,
          program: doc.program,
          ibn: doc.ibn,
          external_id: doc.external_id,
          question_data: doc.question_data,
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

    // Choose an index based on the most selective filter available
    let baseQuery;
    if (filters.skill) {
      baseQuery = ctx.db
        .query('questions')
        .withIndex('by_skill', (q) => q.eq('skill', filters.skill!));
    } else if (filters.domain) {
      baseQuery = ctx.db
        .query('questions')
        .withIndex('by_domain', (q) => q.eq('domain', filters.domain!));
    } else if (filters.difficulty) {
      baseQuery = ctx.db
        .query('questions')
        .withIndex('by_difficulty', (q) =>
          q.eq('difficulty', filters.difficulty!)
        );
    } else if (filters.program) {
      baseQuery = ctx.db
        .query('questions')
        .withIndex('by_program', (q) => q.eq('program', filters.program!));
    } else if (filters.subject) {
      baseQuery = ctx.db
        .query('questions')
        .withIndex('by_subject', (q) => q.eq('subject', filters.subject!));
    } else {
      baseQuery = ctx.db.query('questions');
    }

    let filteredQuery = baseQuery;
    if (filters.subject) {
      filteredQuery = filteredQuery.filter((q) =>
        q.eq(q.field('subject'), filters.subject!)
      );
    }
    if (filters.domain) {
      filteredQuery = filteredQuery.filter((q) =>
        q.eq(q.field('domain'), filters.domain!)
      );
    }
    if (filters.difficulty) {
      filteredQuery = filteredQuery.filter((q) =>
        q.eq(q.field('difficulty'), filters.difficulty!)
      );
    }
    if (filters.program) {
      filteredQuery = filteredQuery.filter((q) =>
        q.eq(q.field('program'), filters.program!)
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
      question_data: item.question_data,
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
        difficulty: v.optional(difficulty),
        skill: v.optional(skill),
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
      const doc = await ctx.db
        .query('questions')
        .withIndex('by_questionId', (q) =>
          q.eq('questionId', filters.questionId!)
        )
        .unique();
      if (!doc) {
        return 0;
      }
      if (
        (filters.program && doc.program !== filters.program) ||
        (filters.subject && doc.subject !== filters.subject) ||
        (filters.domain && doc.domain !== filters.domain) ||
        (filters.difficulty && doc.difficulty !== filters.difficulty) ||
        (filters.skill && doc.skill !== filters.skill) ||
        (filters.onlyInactive && doc.isActive !== false) ||
        (filters.hasExternalId && doc.external_id === null) ||
        (filters.ibnOnly && doc.ibn === null)
      ) {
        return 0;
      }
      return 1;
    }

    const onlyInactive = filters.onlyInactive === true;

    // Helper to rebuild the query each iteration (Convex query builders can't be reused after iteration)
    const buildQuery = () => {
      const tableQuery = ctx.db.query('questions');
      let q = tableQuery.fullTableScan();
      if (filters.skill) {
        q = tableQuery.withIndex('by_skill', (b) =>
          b.eq('skill', filters.skill!)
        );
      } else if (filters.domain) {
        q = tableQuery.withIndex('by_domain', (b) =>
          b.eq('domain', filters.domain!)
        );
      } else if (filters.difficulty) {
        q = tableQuery.withIndex('by_difficulty', (b) =>
          b.eq('difficulty', filters.difficulty!)
        );
      } else if (filters.program) {
        q = tableQuery.withIndex('by_program', (b) =>
          b.eq('program', filters.program!)
        );
      } else if (filters.subject) {
        q = tableQuery.withIndex('by_subject', (b) =>
          b.eq('subject', filters.subject!)
        );
      }
      if (filters.ibnOnly) {
        q = q.filter((b) => b.neq(b.field('ibn'), null));
      }
      if (filters.hasExternalId) {
        q = q.filter((b) => b.neq(b.field('external_id'), null));
      }
      if (onlyInactive) {
        q = q.filter((b) => b.eq(b.field('isActive'), false));
      }
      return q;
    };

    // Single paginated read (Convex allows at most one paginate per function)
    const { page, isDone } = await buildQuery().paginate({
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
  returns: v.union(
    v.object({
      _id: v.id('questions'),
      questionId: v.string(),
      program: v.string(),
      subject: v.string(),
      domain: v.string(),
      difficulty: v.string(),
      skill: v.string(),
      ibn: v.union(v.string(), v.null()),
      external_id: v.union(v.string(), v.null()),
      question_data: v.any(),
      createDate: v.number(),
      updateDate: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query('questions')
      .withIndex('by_questionId', (q) => q.eq('questionId', args.questionId))
      .unique();
    if (!doc) {
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
      question_data: doc.question_data,
      createDate: doc.createDate,
      updateDate: doc.updateDate,
    };
  },
});
