import { MutationCtx, QueryCtx } from "../_generated/server";

export async function getAuthenticatedUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }
  return identity.subject;
}

export async function getOptionalUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
}

export async function requireAuth(ctx: MutationCtx | QueryCtx, providedUserId?: string) {
  const authenticatedUserId = await getAuthenticatedUser(ctx);
  if (providedUserId && providedUserId !== authenticatedUserId) {
    throw new Error("Not authorized");
  }
  return authenticatedUserId;
}
