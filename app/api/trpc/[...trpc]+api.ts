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
