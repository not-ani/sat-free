import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import { mathNotActive, englishNotActive } from "./fluh";

// Initialize Convex client
// You can get your CONVEX_URL from `npx convex dev` or your Convex dashboard
const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
    console.error("❌ CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is required");
    console.log("💡 Run 'npx convex dev' to get your deployment URL");
    process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

async function markQuestionsInactive() {
    const questionsToMarkInactive = [...englishNotActive, ...mathNotActive];
    console.log(`Processing ${questionsToMarkInactive.length} questions to mark as inactive`);
    
    const batchSize = 100;
    let totalUpdated = 0;
    let totalNotFound = 0;
    
    try {
        // Process questions in batches of 100
        for (let i = 0; i < questionsToMarkInactive.length; i += batchSize) {
            const batch = questionsToMarkInactive.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(questionsToMarkInactive.length / batchSize);
            
            console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} questions)...`);
            
            const inactiveResult = await convex.mutation(api.migrations.setQuestionsInactive, {
                questionIds: batch
            });
            
            totalUpdated += inactiveResult.updated;
            totalNotFound += inactiveResult.notFound;
            
            console.log(`Batch ${batchNumber}: ${inactiveResult.updated} updated, ${inactiveResult.notFound} not found`);
            
            // Small delay between batches to be nice to the server
            if (i + batchSize < questionsToMarkInactive.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log(`✅ Successfully marked ${totalUpdated} questions as inactive`);
        if (totalNotFound > 0) {
            console.log(`⚠️  ${totalNotFound} questions were not found in database`);
        }
        
        return {
            questionsMarkedInactive: totalUpdated,
            questionsNotFound: totalNotFound,
            questionsInLists: questionsToMarkInactive.length,
            batchesProcessed: Math.ceil(questionsToMarkInactive.length / batchSize)
        };
        
    } catch (error) {
        console.error("Error marking questions inactive:", error);
        throw error;
    }
}

// Call the function
markQuestionsInactive()
    .then(result => {
        console.log("✅ Successfully completed migration:", result);
        process.exit(0);
    })
    .catch(error => {
        console.error("Error marking questions inactive:", error);
        process.exit(1);
    });