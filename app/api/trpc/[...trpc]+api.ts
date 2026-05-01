import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../../backend/trpc/app-router';
import { createContext } from '../../../backend/trpc/create-context';

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });
};

export async function GET(req: Request) {
  return handler(req);
}

export async function POST(req: Request) {
  return handler(req);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, authorization, x-trpc-source',
    },
  });
}
