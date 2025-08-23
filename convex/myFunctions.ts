import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { api } from './_generated/api';
import { action, mutation, query } from './_generated/server';

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query:
export const listNumbers = query({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const numbers = await ctx.db
      .query('numbers')
      // Ordered by _creationTime, return most recent
      .order('desc')
      .take(args.count);
    const userId = await getAuthUserId(ctx);
    const user = userId === null ? null : await ctx.db.get(userId);
    return {
      viewer: user?.email ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  },
});

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    const _id = await ctx.db.insert('numbers', { value: args.value });
    // Optionally, return a value from your mutation.
    // return id;
  },
});

// Record an attempt for a signed-in user
export const recordAttempt = mutation({
  args: {
    questionId: v.string(),
    // Copy of the submission result from the renderer
    result: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const question = await ctx.db
      .query('questions')
      .withIndex('by_questionId', (q) => q.eq('questionId', args.questionId))
      .unique();
    if (!question) {
      throw new Error('Question not found');
    }

    const now = Date.now();
    const resultType = (args.result?.type ?? null) as
      | 'id_mcq'
      | 'id_spr'
      | 'ibn_mcq'
      | 'ibn_spr'
      | null;
    const isCorrect =
      typeof args.result?.isCorrect === 'boolean'
        ? (args.result.isCorrect as boolean)
        : null;

    await ctx.db.insert('attempts', {
      userId,
      questionRef: question._id,
      questionId: question.questionId,
      subject: question.subject,
      domain: question.domain,
      difficulty: question.difficulty,
      skill: question.skill,
      result: args.result,
      resultType: resultType ?? 'ibn_spr',
      isCorrect,
      createDate: now,
      updateDate: now,
    });
  },
});

// Fetch recent attempts for current user, joined with question meta
export const listMyAttempts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    console.log('userId', userId);
    if (!userId) {
      return [];
    }
    const limit = args.limit ?? 100;
    const attempts = await ctx.db
      .query('attempts')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .take(limit);
    return attempts.map((a) => ({
      _id: a._id,
      questionId: a.questionId,
      subject: a.subject,
      domain: a.domain,
      difficulty: a.difficulty,
      skill: a.skill,
      resultType: a.resultType,
      isCorrect: a.isCorrect,
      createDate: a.createDate,
      updateDate: a.updateDate,
    }));
  },
});

// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const _data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});
