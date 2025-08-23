import { v } from 'convex/values';
import { internal } from './_generated/api';
import { action, internalMutation } from './_generated/server';

// Type definitions to match schema
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Program = 'SAT';
type Subject = 'Reading and Writing' | 'Math';
type Domain =
  | 'Algebra'
  | 'Advanced Math'
  | 'Problem-Solving and Data Analysis'
  | 'Geometry and Trigonometry'
  | 'Information and Ideas'
  | 'Craft and Structure'
  | 'Expression of Ideas'
  | 'Standard English Conventions';
type Skill =
  | 'Central Ideas and Details'
  | 'Inferences'
  | 'Command of Evidence'
  | 'Words in Context'
  | 'Text Structure and Purpose'
  | 'Cross-Text Connections'
  | 'Rhetorical Synthesis'
  | 'Transitions'
  | 'Boundaries'
  | 'Form, Structure, and Sense'
  | 'Linear equations in one variable'
  | 'Linear functions'
  | 'Linear equations in two variables'
  | 'Systems of two linear equations in two variables'
  | 'Linear inequalities in one or two variables'
  | 'Nonlinear functions'
  | 'Nonlinear equations in one variable and systems of equations in two variables'
  | 'Equivalent expressions'
  | 'Ratios, rates, proportional relationships, and units'
  | 'Percentages'
  | 'One-variable data: Distributions and measures of center and spread'
  | 'Two-variable data: Models and scatterplots'
  | 'Probability and conditional probability'
  | 'Inference from sample statistics and margin of error'
  | 'Evaluating statistical claims: Observational studies and experiments'
  | 'Area and volume'
  | 'Lines, angles, and triangles'
  | 'Right triangles and trigonometry'
  | 'Circles';

// Define the question structure for the API
const QuestionInput = v.object({
  questionId: v.string(),
  score_band_range: v.number(),
  skill: v.string(),
  program: v.string(),
  subject: v.string(),
  domain: v.string(),
  ibn: v.union(v.string(), v.null()),
  external_id: v.union(v.string(), v.null()),
  difficulty: v.string(),
  question_data: v.any(),
  updateDate: v.number(),
  createDate: v.number(),
});

export const importQuestionBatch = action({
  args: {
    questions: v.array(QuestionInput),
  },
  returns: v.object({
    totalProcessed: v.number(),
    successfullyImported: v.number(),
    skipped: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const errors: string[] = [];
    let successfullyImported = 0;
    let skipped = 0;

    for (const question of args.questions) {
      try {
        // Insert the question using an internal mutation
        const result = await ctx.runMutation(
          internal.importQuestions.insertQuestion,
          question
        );
        if (result.skipped) {
          // Question already existed, was skipped
          skipped++;
        } else {
          // Question was successfully inserted
          successfullyImported++;
        }
      } catch (error) {
        const errorMsg = `Failed to import question ${question.questionId}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
      }
    }

    return {
      totalProcessed: args.questions.length,
      successfullyImported,
      skipped,
      errors,
    };
  },
});

export const insertQuestion = internalMutation({
  args: {
    questionId: v.string(),
    score_band_range: v.number(),
    skill: v.string(),
    program: v.string(),
    subject: v.string(),
    domain: v.string(),
    ibn: v.union(v.string(), v.null()),
    external_id: v.union(v.string(), v.null()),
    difficulty: v.string(),
    question_data: v.any(), // We'll let the schema validator handle this
    updateDate: v.number(),
    createDate: v.number(),
  },
  returns: v.object({
    result: v.union(v.id('questions'), v.null()),
    skipped: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // Check if question already exists using the index
    const existing = await ctx.db
      .query('questions')
      .withIndex('by_questionId', (q) => q.eq('questionId', args.questionId))
      .first();

    if (existing) {
      // Return null to indicate it was skipped (already exists)
      return { result: null, skipped: true };
    }
    const cleanSkill = (s: string) => s.trim();

    // Cast args to proper types for insertion
    const questionData = {
      questionId: args.questionId,
      score_band_range: args.score_band_range,
      skill: cleanSkill(args.skill) as Skill,
      program: args.program as Program,
      subject: args.subject as Subject,
      domain: args.domain as Domain,
      ibn: args.ibn,
      external_id: args.external_id,
      difficulty: args.difficulty as Difficulty,
      question_data: args.question_data,
      updateDate: args.updateDate,
      createDate: args.createDate,
    };

    // Insert the question
    const insertedId = await ctx.db.insert('questions', questionData);
    return { result: insertedId, skipped: false };
  },
});

export const clearAllQuestions = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const questions = await ctx.db.query('questions').collect();
    let deletedCount = 0;

    for (const question of questions) {
      await ctx.db.delete(question._id);
      deletedCount++;
    }

    return deletedCount;
  },
});

// Helper action to clear all questions (useful for testing)
export const resetQuestions = action({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    await ctx.runMutation(internal.importQuestions.clearAllQuestions, {});
    return 0;
  },
});
