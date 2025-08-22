import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// --- Question schemas (based on Zod schemas in render/id/schema.ts and render/ibn/schema.ts) ---

// ID-style MCQ option
const IdMcqOption = v.object({
  id: v.string(), // UUID string
  content: v.string(),
});

// Base fields shared by ID-style question data
const IdBaseQuestionData = {
  stem: v.string(),
  keys: v.optional(v.array(v.string())),
  rationale: v.string(),
  externalid: v.string(), // UUID string
  correct_answer: v.array(v.string()),

  origin: v.optional(v.string()),
  templateid: v.optional(v.string()),
  vaultid: v.optional(v.string()),
  stimulus: v.optional(v.string()),
} as const;

// ID-style MCQ question data
const IdMcqQuestionData = v.object({
  type: v.literal('mcq'),
  ...IdBaseQuestionData,
  answerOptions: v.optional(v.array(IdMcqOption)),
});

// ID-style SPR question data
const IdSprQuestionData = v.object({
  type: v.literal('spr'),
  answerOptions: v.optional(v.array(v.any())), // allow it
  ...IdBaseQuestionData,
});

// Union of ID-style question data
const IdQuestionData = v.union(IdMcqQuestionData, IdSprQuestionData);

// IBN-style answer choices: record of single-letter keys → body
const IbnMcChoice = v.object({ body: v.string() });
const IbnMcChoices = v.record(v.string(), IbnMcChoice);

// IBN Multiple Choice answer
const IbnMcAnswer = v.object({
  style: v.literal('Multiple Choice'),
  choices: IbnMcChoices,
  correct_choice: v.string(),
  rationale: v.string(),
});

// IBN SPR answer
const IbnSprAnswer = v.object({
  style: v.literal('SPR'),
  rationale: v.string(),
});

// IBN question item (single item; arrays were normalized to singletons when applicable)
const IbnQuestionItem = v.object({
  item_id: v.string(),
  section: v.string(),
  body: v.optional(v.string()),
  prompt: v.string(),
  answer: v.union(IbnMcAnswer, IbnSprAnswer),
  objective: v.optional(v.string()),
});

// question_data can be either ID-style or a single IBN item
const QuestionData = v.union(IdQuestionData, IbnQuestionItem);

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  // primary_class_cd_desc = domain, skill_desc (everything capitalized) = skill, difficulty (H,M,E) = difficulty (Hard, Medium, Easy)
  questions: defineTable({
    questionId: v.string(),
    score_band_range: v.number(),
    skill: v.union(
      // Information and Ideas
      v.literal('Central Ideas and Details'),
      v.literal('Inferences'),
      v.literal('Command of Evidence'),
      // Craft and Structure
      v.literal('Words in Context'),
      v.literal('Text Structure and Purpose'),
      v.literal('Cross-Text Connections'),
      // Expression of Ideas
      v.literal('Rhetorical Synthesis'),
      v.literal('Transitions'),
      // Standard English Conventions
      v.literal('Boundaries'),
      v.literal('Form, Structure, and Sense'),
      // Algebra
      v.literal('Linear equations in one variable'),
      v.literal('Linear functions'),
      v.literal('Linear equations in two variables'),
      v.literal('Systems of two linear equations in two variables'),
      v.literal('Linear inequalities in one or two variables'),
      // Advanced Math
      v.literal('Nonlinear functions'),
      v.literal(
        'Nonlinear equations in one variable and systems of equations in two variables'
      ),
      v.literal('Equivalent expressions'),
      // Problem-Solving and Data Analysis
      v.literal('Ratios, rates, proportional relationships, and units'),
      v.literal('Percentages'),
      v.literal(
        'One-variable data: Distributions and measures of center and spread'
      ),
      v.literal('Two-variable data: Models and scatterplots'),
      v.literal('Probability and conditional probability'),
      v.literal('Inference from sample statistics and margin of error'),
      v.literal(
        'Evaluating statistical claims: Observational studies and experiments'
      ),
      // Geometry and Trigonometry
      v.literal('Area and volume'),
      v.literal('Lines, angles, and triangles'),
      v.literal('Right triangles and trigonometry'),
      v.literal('Circles')
    ),

    program: v.union(v.literal('SAT')),
    subject: v.union(v.literal('Reading and Writing'), v.literal('Math')),
    domain: v.union(
      // Math
      v.literal('Algebra'),
      v.literal('Advanced Math'),
      v.literal('Problem-Solving and Data Analysis'),
      v.literal('Geometry and Trigonometry'),
      // English
      v.literal('Information and Ideas'),
      v.literal('Craft and Structure'),
      v.literal('Expression of Ideas'),
      v.literal('Standard English Conventions')
    ),
    ibn: v.union(v.string(), v.null()),
    external_id: v.union(v.string(), v.null()),
    difficulty: v.union(
      v.literal('Easy'),
      v.literal('Medium'),
      v.literal('Hard')
    ),
    question_data: QuestionData,
    updateDate: v.number(),
    createDate: v.number(),
  })
    .index('by_questionId', ['questionId']) // unique logical key from dataset
    .index('by_skill', ['skill']) // for filtering by skill
    .index('by_program', ['program']) // e.g., SAT
    .index('by_domain', ['domain']) // Math or English
    .index('by_difficulty', ['difficulty']) // content cluster
    .index('by_external_id', ['external_id']) // may be null
    .index('by_ibn', ['ibn']), // distinguish IBN-sourced entries
});
