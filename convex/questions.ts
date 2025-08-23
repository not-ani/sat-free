import { v } from 'convex/values';
import { query } from './_generated/server';
import { difficulty, domain, skill, subject } from './questionsFilters';

export const list = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    sort: v.optional(v.union(v.literal('updateDate'), v.literal('createDate'))),
    order: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
    filters: v.optional(
      v.object({
        program: v.optional(v.string()),
        subject: v.optional(subject),
        domain: v.optional(domain),
        difficulty: v.optional(difficulty),
        skill: v.optional(skill),
        ibnOnly: v.optional(v.boolean()),
        hasExternalId: v.optional(v.boolean()),
        questionId: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;
    const order = args.order ?? 'desc';
    const filters = args.filters ?? {};

    // Get items with proper filtering and ordering
    let items;

    if (filters.skill) {
      const baseQuery = ctx.db
        .query('questions')
        .withIndex('by_skill', (q) => q.eq('skill', filters.skill!));

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
        filteredQuery = filteredQuery.filter((q) =>
          q.neq(q.field('ibn'), null)
        );
      }
      if (filters.hasExternalId) {
        filteredQuery = filteredQuery.filter((q) =>
          q.neq(q.field('external_id'), null)
        );
      }
      if (filters.questionId) {
        filteredQuery = filteredQuery.filter((q) =>
          q.eq(q.field('questionId'), filters.questionId!)
        );
      }

      const orderedQuery =
        order === 'asc'
          ? filteredQuery.order('asc')
          : filteredQuery.order('desc');
      items = await orderedQuery.take(pageSize * page + 1);
    } else if (filters.domain) {
      const baseQuery = ctx.db
        .query('questions')
        .withIndex('by_domain', (q) => q.eq('domain', filters.domain!));

      let filteredQuery = baseQuery;
      if (filters.subject) {
        filteredQuery = filteredQuery.filter((q) =>
          q.eq(q.field('subject'), filters.subject!)
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
        filteredQuery = filteredQuery.filter((q) =>
          q.neq(q.field('ibn'), null)
        );
      }
      if (filters.hasExternalId) {
        filteredQuery = filteredQuery.filter((q) =>
          q.neq(q.field('external_id'), null)
        );
      }
      if (filters.questionId) {
        filteredQuery = filteredQuery.filter((q) =>
          q.eq(q.field('questionId'), filters.questionId!)
        );
      }

      const orderedQuery =
        order === 'asc'
          ? filteredQuery.order('asc')
          : filteredQuery.order('desc');
      items = await orderedQuery.take(pageSize * page + 1);
    } else if (filters.difficulty) {
      const baseQuery = ctx.db
        .query('questions')
        .withIndex('by_difficulty', (q) =>
          q.eq('difficulty', filters.difficulty!)
        );

      let filteredQuery = baseQuery;
      if (filters.subject) {
        filteredQuery = filteredQuery.filter((q) =>
          q.eq(q.field('subject'), filters.subject!)
        );
      }
      if (filters.program) {
        filteredQuery = filteredQuery.filter((q) =>
          q.eq(q.field('program'), filters.program!)
        );
      }
      if (filters.ibnOnly) {
        filteredQuery = filteredQuery.filter((q) =>
          q.neq(q.field('ibn'), null)
        );
      }
      if (filters.hasExternalId) {
        filteredQuery = filteredQuery.filter((q) =>
          q.neq(q.field('external_id'), null)
        );
      }
      if (filters.questionId) {
        filteredQuery = filteredQuery.filter((q) =>
          q.eq(q.field('questionId'), filters.questionId!)
        );
      }

      const orderedQuery =
        order === 'asc'
          ? filteredQuery.order('asc')
          : filteredQuery.order('desc');
      items = await orderedQuery.take(pageSize * page + 1);
    } else {
      let baseQuery = ctx.db.query('questions');

      if (filters.subject) {
        baseQuery = baseQuery.filter((q) =>
          q.eq(q.field('subject'), filters.subject!)
        );
      }
      if (filters.program) {
        baseQuery = baseQuery.filter((q) =>
          q.eq(q.field('program'), filters.program!)
        );
      }
      if (filters.ibnOnly) {
        baseQuery = baseQuery.filter((q) => q.neq(q.field('ibn'), null));
      }
      if (filters.hasExternalId) {
        baseQuery = baseQuery.filter((q) =>
          q.neq(q.field('external_id'), null)
        );
      }
      if (filters.questionId) {
        baseQuery = baseQuery.filter((q) =>
          q.eq(q.field('questionId'), filters.questionId!)
        );
      }

      const orderedQuery =
        order === 'asc' ? baseQuery.order('asc') : baseQuery.order('desc');
      items = await orderedQuery.take(pageSize * page + 1);
    }

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
    }));

    // Check if there are more pages
    const hasMore = items.length > endIndex;

    return {
      rows,
      hasMore,
    };
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
