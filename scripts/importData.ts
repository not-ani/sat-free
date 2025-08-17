import { ConvexHttpClient } from 'convex/browser';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { api } from '../convex/_generated/api';

// Type definitions matching the raw data structure
interface RawQuestion {
  updateDate: number;
  pPcc: string;
  questionId: string;
  skill_cd: string;
  score_band_range_cd: number;
  uId: string;
  skill_desc: string;
  createDate: number;
  program: string;
  primary_class_cd_desc: string;
  ibn: string;
  external_id: string;
  primary_class_cd: string;
  difficulty: string;
  question_data: unknown;
}

// Processed question structure
interface ProcessedQuestion {
  questionId: string;
  score_band_range: number;
  skill: string;
  program: string;
  subject: string;
  domain: string;
  ibn: string | null;
  external_id: string | null;
  difficulty: string;
  question_data: unknown;
  updateDate: number;
  createDate: number;
}

// Type definitions matching schema
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Domain =
  | 'Algebra'
  | 'Advanced Math'
  | 'Problem-Solving and Data Analysis'
  | 'Geometry and Trigonometry'
  | 'Information and Ideas'
  | 'Craft and Structure'
  | 'Expression of Ideas'
  | 'Standard English Conventions';

// Difficulty mapping
const difficultyMap: Record<string, Difficulty> = {
  H: 'Hard',
  M: 'Medium',
  E: 'Easy',
};

// Domain mapping based on primary_class_cd_desc
const domainMap: Record<string, Domain> = {
  Algebra: 'Algebra',
  'Advanced Math': 'Advanced Math',
  'Problem-Solving and Data Analysis': 'Problem-Solving and Data Analysis',
  'Geometry and Trigonometry': 'Geometry and Trigonometry',
  'Information and Ideas': 'Information and Ideas',
  'Craft and Structure': 'Craft and Structure',
  'Expression of Ideas': 'Expression of Ideas',
  'Standard English Conventions': 'Standard English Conventions',
};

function processQuestion(rawQuestion: RawQuestion): ProcessedQuestion {
  const domain = domainMap[rawQuestion.primary_class_cd_desc];
  const difficulty = difficultyMap[rawQuestion.difficulty];

  if (!domain) {
    throw new Error(`Unknown domain: ${rawQuestion.primary_class_cd_desc}`);
  }
  if (!difficulty) {
    throw new Error(`Unknown difficulty: ${rawQuestion.difficulty}`);
  }
  // Extract only the fields we want from question_data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qd: any = rawQuestion.question_data ?? {};
  const question_data = {
    type: qd.type,
    stem: qd.stem,
    keys: qd.keys,
    rationale: qd.rationale,
    externalid: qd.externalid,
    correct_answer: qd.correct_answer,
    origin: qd.origin,
    templateid: qd.templateid,
    vaultid: qd.vaultid,
    stimulus: qd.stimulus, // keep stimulus
    answerOptions: qd.answerOptions,
  };

  return {
    questionId: String(rawQuestion.questionId),
    score_band_range: Number(rawQuestion.score_band_range_cd),
    skill: rawQuestion.skill_desc,
    program: rawQuestion.program,
    subject: 'Reading and Writing', // All questions in this dataset are Math
    domain,
    ibn: rawQuestion.ibn === '' ? null : String(rawQuestion.ibn),
    external_id:
      rawQuestion.external_id === '' ? null : String(rawQuestion.external_id),
    difficulty,
    question_data,
    updateDate: Number(rawQuestion.updateDate),
    createDate: Number(rawQuestion.createDate),
  };
}

async function importQuestions() {
  try {
    // Read the normalized JSON file
    const filePath = join(process.cwd(), 'questions_data_english.json');
    console.log(`Reading file: ${filePath}`);

    const fileContent = readFileSync(filePath, 'utf8');
    const rawQuestions: RawQuestion[] = JSON.parse(fileContent);

    console.log(`Found ${rawQuestions.length} questions to process`);

    // Process questions locally
    const processedQuestions: ProcessedQuestion[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rawQuestions.length; i++) {
      try {
        const processed = processQuestion(rawQuestions[i]);
        processedQuestions.push(processed);

        if ((i + 1) % 1000 === 0) {
          console.log(`Processed ${i + 1}/${rawQuestions.length} questions`);
        }
      } catch (error) {
        const errorMsg = `Failed to process question ${rawQuestions[i].questionId}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(
      `Successfully processed ${processedQuestions.length} questions`
    );
    if (errors.length > 0) {
      console.warn(`${errors.length} questions failed to process`);
    }

    // Initialize Convex client
    const convexUrl =
      process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
    if (!convexUrl) {
      throw new Error('CONVEX_URL environment variable is required');
    }

    console.log('Connecting to Convex...');
    const client = new ConvexHttpClient(convexUrl);

    // Clear existing questions first (optional - commented out since we now skip duplicates)
    // console.log("Clearing existing questions...");
    // const deletedCount = await client.action(api.importQuestions.resetQuestions, {});
    // console.log(`Deleted ${deletedCount} existing questions`);

    // Import processed questions in batches
    const batchSize = 100;
    let totalImported = 0;
    let totalSkipped = 0;
    const importErrors: string[] = [];

    for (let i = 0; i < processedQuestions.length; i += batchSize) {
      const batch = processedQuestions.slice(i, i + batchSize);

      try {
        console.log(
          `Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(processedQuestions.length / batchSize)} (${batch.length} questions)`
        );

        const result = await client.action(
          api.importQuestions.importQuestionBatch,
          {
            questions: batch,
          }
        );

        totalImported += result.successfullyImported;
        totalSkipped += result.skipped;
        importErrors.push(...result.errors);

        console.log(
          `Batch result: ${result.successfullyImported} imported, ${result.skipped} skipped, ${result.errors.length} errors`
        );

        // Small delay between batches
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        const errorMsg = `Failed to import batch: ${error instanceof Error ? error.message : String(error)}`;
        importErrors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // Write failed IDs and reasons to a txt file
    const allErrors = [...errors, ...importErrors];
    if (allErrors.length > 0) {
      const errorFilePath = join(process.cwd(), 'import_errors.txt');
      const timestamp = new Date().toISOString();
      const errorContent = [
        `Import Errors Report - ${timestamp}`,
        '=========================================',
        `Total questions processed: ${rawQuestions.length}`,
        `Successfully imported: ${totalImported}`,
        `Skipped (already exist): ${totalSkipped}`,
        `Failed: ${allErrors.length}`,
        '',
        'Failed Question IDs and Reasons:',
        '================================',
        ...allErrors.map((error, index) => `${index + 1}. ${error}`),
        '',
        'End of Report',
      ].join('\n');

      writeFileSync(errorFilePath, errorContent, 'utf8');
      console.log(`\nError report written to: ${errorFilePath}`);
    }

    console.log('\n=== Import Complete ===');
    console.log(`Total processed: ${rawQuestions.length}`);
    console.log(`Successfully imported: ${totalImported}`);
    console.log(`Skipped (already exist): ${totalSkipped}`);
    console.log(`Processing errors: ${errors.length}`);
    console.log(`Import errors: ${importErrors.length}`);

    if (allErrors.length > 0) {
      console.log('\nFirst 10 errors:');
      allErrors.slice(0, 10).forEach((err) => console.log(`- ${err}`));
      console.log('\nFull error details written to import_errors.txt');
    }
  } catch (error) {
    console.error(
      `Import failed: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importQuestions()
    .then(() => {
      console.log('Import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}

export { importQuestions, processQuestion };
