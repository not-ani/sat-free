# Question Migration Script

This script marks specific questions as inactive based on the lists in `fluh.ts`.

## Setup

1. Make sure your Convex backend is running:

   ```bash
   npm run dev:backend
   ```

2. Get your Convex URL from the terminal output or dashboard and set it as an environment variable:
   ```bash
   export CONVEX_URL="https://your-deployment-url.convex.cloud"
   # OR
   export NEXT_PUBLIC_CONVEX_URL="https://your-deployment-url.convex.cloud"
   ```

## Running the Migration

```bash
npm run mark-inactive
```

This will:

1. Check the current state of questions
2. Mark all questions from the `englishNotActive` and `mathNotActive` arrays as inactive
3. Show a summary of the changes made

## What the Script Does

- **Input**: Question IDs from `fluh.ts` (`englishNotActive` and `mathNotActive` arrays)
- **Action**: Sets `isActive: false` for those specific questions
- **Output**: Summary of how many questions were updated and how many were not found

## Files Modified

- `write.ts` - Main migration script
- `convex/migrations.ts` - Added `setQuestionsInactive` mutation
- `package.json` - Added `mark-inactive` script

## Functions Available

- `setAllQuestionsInactive()` - Sets ALL questions as inactive
- `setQuestionsActive(questionIds)` - Sets specific questions as active
- `setQuestionsInactive(questionIds)` - Sets specific questions as inactive
- `countQuestionsNeedingUpdate()` - Counts questions that need updating

## Troubleshooting

If you get a "CONVEX_URL is required" error:

1. Run `npx convex dev` to start your backend
2. Copy the deployment URL from the terminal
3. Set it as an environment variable before running the script
