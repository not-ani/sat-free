import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api';
import { englishNotActive, mathNotActive } from './fluh';

// Initialize Convex client
// You can get your CONVEX_URL from `npx convex dev` or your Convex dashboard
const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

async function markQuestionsInactive() {
  const questionsToMarkInactive = [...englishNotActive, ...mathNotActive];

  const batchSize = 100;
  let totalUpdated = 0;
  let totalNotFound = 0;
  // Process questions in batches of 100
  for (let i = 0; i < questionsToMarkInactive.length; i += batchSize) {
    const batch = questionsToMarkInactive.slice(i, i + batchSize);
    const _batchNumber = Math.floor(i / batchSize) + 1;
    const _totalBatches = Math.ceil(questionsToMarkInactive.length / batchSize);

    const inactiveResult = await convex.mutation(
      api.migrations.setQuestionsInactive,
      {
        questionIds: batch,
      }
    );

    totalUpdated += inactiveResult.updated;
    totalNotFound += inactiveResult.notFound;

    // Small delay between batches to be nice to the server
    if (i + batchSize < questionsToMarkInactive.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  if (totalNotFound > 0) {
  }

  return {
    questionsMarkedInactive: totalUpdated,
    questionsNotFound: totalNotFound,
    questionsInLists: questionsToMarkInactive.length,
    batchesProcessed: Math.ceil(questionsToMarkInactive.length / batchSize),
  };
}

// Call the function
markQuestionsInactive()
  .then((_result) => {
    process.exit(0);
  })
  .catch((_error) => {
    process.exit(1);
  });
