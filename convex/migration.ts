import { Migrations } from '@convex-dev/migrations';
import { components } from './_generated/api.js';
import type { DataModel } from './_generated/dataModel.js';

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

/*
export const migrateQuestionsToIndependentTable = migrations.define({
  table: 'questions',
  migrateOne: async (ctx, doc) => {
    const questionData = doc.question_data;
    if (!questionData) {
      return;
    }
    await ctx.db.insert('questions_data', {
      questionId: doc._id,
      question_data: questionData,
    });

    await ctx.db.patch(doc._id, {
      question_data: undefined,
    });
  },
});

export const runQuestionsDataMigration = migrations.runner(
  internal.migration.migrateQuestionsToIndependentTable
);
*/
