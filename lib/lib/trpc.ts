import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { supabase } from "@/lib/supabase";

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

const getAuthHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  return {
    "content-type": "application/json",
    ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
  };
};

const fetchHandler = async (url: RequestInfo | URL, options?: RequestInit) => {
  const mergedHeaders = {
    ...(options?.headers ?? {}),
    ...(await getAuthHeaders()),
  };

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
    credentials: "same-origin",
  });

  if (!response.ok) {
    const text = await response.clone().text();
    console.error("tRPC Error Response:", {
      url: String(url),
      status: response.status,
      body: text.substring(0, 500),
    });
  }

  return response;
};

export const trpcReactClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: fetchHandler,
    }),
  ],
});
