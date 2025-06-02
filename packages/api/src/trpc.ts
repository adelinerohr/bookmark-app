import { SupabaseClient } from "@supabase/supabase-js";
import { initTRPC, TRPCError } from "@trpc/server";

import { db } from "@workspace/database/client";
import SuperJSON from "superjson";
import { ZodError } from "zod";

/**
 * CONTEXT
 *
 * This section defines the "contexts" that are available to the API.
 * These allow you to access things when processing a request, like the database, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and
 * RSC clients each wrap this and provides the required context.
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  supabase: SupabaseClient;
}) => {
  const supabase = opts.supabase;

  // React Native will pass their token through headers,
  // browsers will have the session cookie set
  const token = opts.headers.get("authorization");

  const user = token
    ? await supabase.auth.getUser(token)
    : await supabase.auth.getUser();

  const source = opts.headers.get("x-trpc-source") ?? "unknown";
  console.log(">>> tRPC Request from", source, "by", user.data.user?.email);

  return {
    user: user.data.user,
    db,
  };
};

/**
 * INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting
 * the context and transformer.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: SuperJSON,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

// Create server-side caller
export const createCallerFactory = t.createCallerFactory;

/**
 * ROUTER & PROCEDURE
 *
 * These are the pieces you use to build your tRPC API.
 * You should import these a lot in the routers folder.
 */

// Create a new router
export const createTRPCRouter = t.router;

// Public (unauthed) procedure
export const publicProcedure = t.procedure;

// Protected (authed) procedure
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});
