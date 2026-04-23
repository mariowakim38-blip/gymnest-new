import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../create-context';

export { publicProcedure };

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }

  const { data: { user }, error } = await ctx.supabase.auth.getUser(ctx.token);

  if (error || !user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid token',
    });
  }

  const { data: profile } = await ctx.supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return next({
    ctx: {
      ...ctx,
      user,
      profile,
    },
  });
});
