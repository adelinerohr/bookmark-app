import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { AppRouter, appRouter } from "./root";
import { createCallerFactory, createTRPCContext } from "./trpc";

/**
 * Create a server-side caller for tRPC.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.Post.all();
 */
const createCaller = createCallerFactory(appRouter);

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId'];
 */
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type PostByIdOutput = RouterOutputs['post']['byId'];
 */
type RouterOutputs = inferRouterOutputs<AppRouter>;

export { createTRPCContext, appRouter, createCaller };
export type { AppRouter, RouterInputs, RouterOutputs };
