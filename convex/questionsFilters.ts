import { v } from 'convex/values';

export const programs = ['SAT'] as const;

export const subjects = ['Reading and Writing', 'Math'] as const;

export const domains = [
  // Math
  'Algebra',
  'Advanced Math',
  'Problem-Solving and Data Analysis',
  'Geometry and Trigonometry',
  // English
  'Information and Ideas',
  'Craft and Structure',
  'Expression of Ideas',
  'Standard English Conventions',
] as const;

export const difficulties = ['Easy', 'Medium', 'Hard'] as const;

export const skills = [
  // Information and Ideas
  'Central Ideas and Details',
  'Inferences',
  'Command of Evidence',
  // Craft and Structure
  'Words in Context',
  'Text Structure and Purpose',
  'Cross-Text Connections',
  // Expression of Ideas
  'Rhetorical Synthesis',
  'Transitions',
  // Standard English Conventions
  'Boundaries',
  'Form, Structure, and Sense',
  // Algebra
  'Linear equations in one variable',
  'Linear functions',
  'Linear equations in two variables',
  'Systems of two linear equations in two variables',
  'Linear inequalities in one or two variables',
  // Advanced Math
  'Nonlinear functions',
  'Nonlinear equations in one variable and systems of equations in two variables',
  'Equivalent expressions',
  // Problem-Solving and Data Analysis
  'Ratios, rates, proportional relationships, and units',
  'Percentages',
  'One-variable data: Distributions and measures of center and spread',
  'Two-variable data: Models and scatterplots',
  'Probability and conditional probability',
  'Inference from sample statistics and margin of error',
  'Evaluating statistical claims: Observational studies and experiments',
  // Geometry and Trigonometry
  'Area and volume',
  'Lines, angles, and triangles',
  'Right triangles and trigonometry',
  'Circles',
] as const;

export const subjectToDomains: Record<
  (typeof subjects)[number],
  Set<(typeof domains)[number]>
> = {
  Math: new Set([
    'Algebra',
    'Advanced Math',
    'Problem-Solving and Data Analysis',
    'Geometry and Trigonometry',
  ]),
  'Reading and Writing': new Set([
    'Information and Ideas',
    'Craft and Structure',
    'Expression of Ideas',
    'Standard English Conventions',
  ]),
};

export type Program = (typeof programs)[number];
export type Subject = (typeof subjects)[number];
export type Domain = (typeof domains)[number];
export type Difficulty = (typeof difficulties)[number];
export type Skill = (typeof skills)[number];

export const domainToSkills: Record<Domain, Set<Skill>> = {
  // Reading and Writing
  'Information and Ideas': new Set([
    'Central Ideas and Details',
    'Inferences',
    'Command of Evidence',
  ]),
  'Craft and Structure': new Set([
    'Words in Context',
    'Text Structure and Purpose',
    'Cross-Text Connections',
  ]),
  'Expression of Ideas': new Set(['Rhetorical Synthesis', 'Transitions']),
  'Standard English Conventions': new Set([
    'Boundaries',
    'Form, Structure, and Sense',
  ]),

  // Math
  Algebra: new Set([
    'Linear equations in one variable',
    'Linear functions',
    'Linear equations in two variables',
    'Systems of two linear equations in two variables',
    'Linear inequalities in one or two variables',
  ]),
  'Advanced Math': new Set([
    'Nonlinear functions',
    'Nonlinear equations in one variable and systems of equations in two variables',
    'Equivalent expressions',
  ]),
  'Problem-Solving and Data Analysis': new Set([
    'Ratios, rates, proportional relationships, and units',
    'Percentages',
    'One-variable data: Distributions and measures of center and spread',
    'Two-variable data: Models and scatterplots',
    'Probability and conditional probability',
    'Inference from sample statistics and margin of error',
    'Evaluating statistical claims: Observational studies and experiments',
  ]),
  'Geometry and Trigonometry': new Set([
    'Area and volume',
    'Lines, angles, and triangles',
    'Right triangles and trigonometry',
    'Circles',
  ]),
};

export const skill = v.union(
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
  v.literal('Area and volume'),
  v.literal('Lines, angles, and triangles'),
  v.literal('Right triangles and trigonometry'),
  v.literal('Circles')
);
export const program = v.union(v.literal('SAT'));
export const subject = v.union(
  v.literal('Reading and Writing'),
  v.literal('Math')
);
export const domain = v.union(
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
);
export const difficulty = v.union(
  v.literal('Easy'),
  v.literal('Medium'),
  v.literal('Hard')
);
