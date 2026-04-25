import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../backend/trpc/app-router";
import { createContext } from "../../../backend/trpc/create-context";

export const dynamic = "force-dynamic";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
