import { v } from 'convex/values';
import { internalMutation, mutation } from './_generated/server';

/**
 * Migration to set all questions as non-active by default
 * This will batch update questions in chunks for performance
 */
export const setAllQuestionsInactive = mutation({
  args: {},
  returns: v.object({
    totalUpdated: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    let totalUpdated = 0;
    const batchSize = 100; // Process 100 questions at a time

    // Get all questions that don't have isActive field set or are active
    while (true) {
      const questions = await ctx.db
        .query('questions')
        .filter((q) =>
          q.or(
            q.eq(q.field('isActive'), undefined),
            q.eq(q.field('isActive'), true)
          )
        )
        .take(batchSize);

      if (questions.length === 0) {
        break; // No more questions to update
      }

      // Update each question in this batch
      for (const question of questions) {
        await ctx.db.patch(question._id, {
          isActive: false,
          updateDate: Date.now(),
        });
        totalUpdated++;
      }

      // Break if we processed less than a full batch (we're done)
      if (questions.length < batchSize) {
        break;
      }
    }

    return {
      totalUpdated,
      message: `Successfully updated ${totalUpdated} questions to inactive status`,
    };
  },
});

/**
 * Count how many questions need to be updated
 */
export const countQuestionsNeedingUpdate = mutation({
  args: {},
  returns: v.object({
    needsUpdate: v.number(),
    total: v.number(),
  }),
  handler: async (ctx, args) => {
    // Count all questions
    const allQuestions = await ctx.db.query('questions').collect();

    // Count questions that need updating (no isActive field or isActive is true)
    const needsUpdate = allQuestions.filter(
      (q) => q.isActive === undefined || q.isActive === true
    ).length;

    return {
      needsUpdate,
      total: allQuestions.length,
    };
  },
});

/**
 * Set specific questions as active by questionId
 */
export const setQuestionsActive = mutation({
  args: {
    questionIds: v.array(v.string()),
  },
  returns: v.object({
    updated: v.number(),
    notFound: v.number(),
  }),
  handler: async (ctx, args) => {
    let updated = 0;
    let notFound = 0;

    for (const questionId of args.questionIds) {
      const question = await ctx.db
        .query('questions')
        .withIndex('by_questionId', (q) => q.eq('questionId', questionId))
        .unique();

      if (question) {
        await ctx.db.patch(question._id, {
          isActive: true,
          updateDate: Date.now(),
        });
        updated++;
      } else {
        notFound++;
      }
    }

    return { updated, notFound };
  },
});

/**
 * Set specific questions as inactive by questionId
 */
export const setQuestionsInactive = mutation({
  args: {
    questionIds: v.array(v.string()),
  },
  returns: v.object({
    updated: v.number(),
    notFound: v.number(),
  }),
  handler: async (ctx, args) => {
    let updated = 0;
    let notFound = 0;

    for (const questionId of args.questionIds) {
      const question = await ctx.db
        .query('questions')
        .withIndex('by_questionId', (q) => q.eq('questionId', questionId))
        .unique();

      if (question) {
        await ctx.db.patch(question._id, {
          isActive: false,
          updateDate: Date.now(),
        });
        updated++;
      } else {
        notFound++;
      }
    }

    return { updated, notFound };
  },
});
