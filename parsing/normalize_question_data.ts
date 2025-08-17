import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const rootFile = join(process.cwd(), 'questions_data_math.json');
const normalizedOut = join(
  process.cwd(),
  'questions_data_math.normalized.json'
);
const multiIdsOut = join(
  process.cwd(),
  'parsing',
  'question_data_multi_ids.json'
);

function main() {
  const raw = readFileSync(rootFile, 'utf8');
  /** @type {Array<any>} */
  const data = JSON.parse(raw);

  /** @type {string[]} */
  const multiIds = [];

  for (const item of data) {
    if (!item || typeof item !== 'object') continue;
    const qd = item.question_data;
    if (Array.isArray(qd)) {
      if (qd.length === 1) {
        item.question_data = qd[0];
      } else if (qd.length > 1) {
        const id = item.questionId ?? item.question_id ?? item.id ?? null;
        if (id) multiIds.push(String(id));
      }
    }
  }

  writeFileSync(normalizedOut, JSON.stringify(data, null, 2), 'utf8');
  writeFileSync(
    multiIdsOut,
    JSON.stringify({ count: multiIds.length, ids: multiIds }, null, 2),
    'utf8'
  );

  console.log(`Normalized file written: ${normalizedOut}`);
  console.log(`Multi-entry IDs written (${multiIds.length}): ${multiIdsOut}`);
}

main();
