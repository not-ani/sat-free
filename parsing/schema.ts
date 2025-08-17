import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod/v4';
import { IbnQuestionItemSchema } from '@/render/ibn/schema';
import { QuestionDataSchema } from '@/render/id/schema';

const schema = z.object({
  updateDate: z.number(),
  pPcc: z.string(),
  questionId: z.string(),
  skill_cd: z.string(),
  score_band_range_cd: z.number(),
  uId: z.string(),
  skill_desc: z.string(),
  createDate: z.number(),
  program: z.string(),
  primary_class_cd_desc: z.string(),
  ibn: z.union([z.string().length(0), z.string(), z.null()]),
  external_id: z.union([z.string().length(0), z.string(), z.null()]),
  primary_class_cd: z.string(),
  difficulty: z.string(),
  // question_data can be either an ID-style object (mcq/spr) or an array of IBN items
  question_data: z.union([QuestionDataSchema, IbnQuestionItemSchema]),
});

function prase() {
  const filePath = join(process.cwd(), './questions_data_english.json');
  const file = readFileSync(filePath, 'utf8');
  const failed: string[] = [];
  // file contains an array of objects
  const data = JSON.parse(file);
  //parse each object in the array
  const parsed = (data as unknown[]).map((raw: unknown) => {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      failed.push(raw.questionId as string);
    }
    return parsed.data;
  });
  return parsed;
}

const _parsed = prase();
