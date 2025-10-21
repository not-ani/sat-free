import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const IdMcqOption = v.object({
  id: v.string(),
  content: v.string(),
});

const IdBaseQuestionData = {
  stem: v.string(),
  keys: v.optional(v.array(v.string())),
  rationale: v.string(),
  externalid: v.string(),
  correct_answer: v.array(v.string()),

  origin: v.optional(v.string()),
  templateid: v.optional(v.string()),
  vaultid: v.optional(v.string()),
  stimulus: v.optional(v.string()),
} as const;

const IdMcqQuestionData = v.object({
  type: v.literal('mcq'),
  ...IdBaseQuestionData,
  answerOptions: v.optional(v.array(IdMcqOption)),
});

const IdSprQuestionData = v.object({
  type: v.literal('spr'),
  answerOptions: v.optional(v.array(v.any())),
  ...IdBaseQuestionData,
});

const IdQuestionData = v.union(IdMcqQuestionData, IdSprQuestionData);

const IbnMcChoice = v.object({ body: v.string() });
const IbnMcChoices = v.record(v.string(), IbnMcChoice);

const IbnMcAnswer = v.object({
  style: v.literal('Multiple Choice'),
  choices: IbnMcChoices,
  correct_choice: v.string(),
  rationale: v.string(),
});

const IbnSprAnswer = v.object({
  style: v.literal('SPR'),
  rationale: v.string(),
});

const IbnQuestionItem = v.object({
  item_id: v.string(),
  section: v.string(),
  body: v.optional(v.string()),
  prompt: v.string(),
  answer: v.union(IbnMcAnswer, IbnSprAnswer),
  objective: v.optional(v.string()),
});

const QuestionData = v.union(IdQuestionData, IbnQuestionItem);

const skills = v.union(
  // English
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
);

const domains = v.union(
  v.literal('Algebra'),
  v.literal('Advanced Math'),
  v.literal('Problem-Solving and Data Analysis'),
  v.literal('Geometry and Trigonometry'),
  v.literal('Information and Ideas'),
  v.literal('Craft and Structure'),
  v.literal('Expression of Ideas'),
  v.literal('Standard English Conventions')
);

export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),

  attempts: defineTable({
    userId: v.id('users'),
    questionRef: v.id('questions'),
    questionId: v.string(),
    subject: v.string(),
    domain: v.string(),
    difficulty: v.string(),
    skill: v.string(),
    result: v.any(),
    resultType: v.union(
      v.literal('id_mcq'),
      v.literal('id_spr'),
      v.literal('ibn_mcq'),
      v.literal('ibn_spr')
    ),
    isCorrect: v.union(v.boolean(), v.null()),
    createDate: v.number(),
    updateDate: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_question', ['userId', 'questionId'])
    .index('by_user_and_skill', ['userId', 'skill'])
    .index('by_user_and_domain', ['userId', 'domain']),
  questions: defineTable({
    questionId: v.string(),
    score_band_range: v.number(),
    isActive: v.optional(v.boolean()),
    skill: skills,
    program: v.union(v.literal('SAT')),
    subject: v.union(v.literal('Reading and Writing'), v.literal('Math')),
    domain: domains,
    ibn: v.union(v.string(), v.null()),
    external_id: v.union(v.string(), v.null()),
    difficulty: v.union(
      v.literal('Easy'),
      v.literal('Medium'),
      v.literal('Hard')
    ),
    updateDate: v.number(),
    createDate: v.number(),
  })
    .index('by_questionId', ['questionId'])
    .index('by_skill', ['skill'])
    .index('by_subject', ['subject'])
    .index('by_domain', ['domain'])
    .index('by_difficulty', ['difficulty']),

  questions_data: defineTable({
    questionId: v.id('questions'),
    question_data: QuestionData,
  }).index('by_questionId', ['questionId']),
});
