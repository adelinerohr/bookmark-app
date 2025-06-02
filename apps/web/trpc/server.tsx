import { createCaller, createTRPCContext } from "@workspace/api";
import { headers } from "next/headers";
import { cache } from "react";
import { createClient } from "~/utils/supabase/server";

const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  const supabase = await createClient();

  return createTRPCContext({
    supabase,
    headers: heads,
  });
});

export const api = createCaller(createContext);
