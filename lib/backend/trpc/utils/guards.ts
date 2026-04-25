import { TRPCError } from '@trpc/server';

export function requireAdmin(ctx: { profile?: { role?: string } | null }) {
  if (ctx.profile?.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
}

export function requireAuthenticatedProfile(ctx: { profile?: { id?: string } | null }) {
  if (!ctx.profile?.id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authenticated profile required',
    });
  }
}
