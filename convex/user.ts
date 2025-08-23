import { getAuthUserId } from '@convex-dev/auth/server';
import { query } from './_generated/server';

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    console.log('userId', userId);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    console.log('user', user);
    return user;
  },
});
