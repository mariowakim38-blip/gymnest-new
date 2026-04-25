import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { supabase } from "@/lib/supabase";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_RORK_API_BASE_URL || '';
};

const getAuthHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  return {
    'content-type': 'application/json',
    ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
  };
};

const createFetchHandler = () => {
  return async (url: RequestInfo | URL, options?: RequestInit) => {
    try {
      const mergedHeaders = {
        ...(options?.headers ?? {}),
        ...(await getAuthHeaders()),
      };

      const response = await fetch(url, {
        ...options,
        headers: mergedHeaders,
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const text = await response.clone().text();
        console.error('tRPC Error Response:', {
          status: response.status,
          body: text.substring(0, 500),
        });
      }

      return response;
    } catch (error) {
      console.error('tRPC Fetch Error:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };
};

const fetchHandler = createFetchHandler();

export const trpcReactClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: fetchHandler,
    }),
  ],
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: fetchHandler,
    }),
  ],
});
