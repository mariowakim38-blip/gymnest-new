import { Hono } from "hono";
import { cors } from "hono/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

app.use("*", async (c, next) => {
  await next();
});

app.all("/api/trpc/*", async (c) => {
  try {
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req: c.req.raw,
      router: appRouter,
      createContext,
      onError: ({ error, path, type }) => {
        console.error(`tRPC Error [${type}] on ${path}:`, error.message);
      },
    });
    
    return response;
  } catch (error) {
    console.error('tRPC Handler Error:', error);
    return c.json({
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    }, 500);
  }
});

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/api", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/health", (c) => {
  return c.json({ 
    status: "ok", 
    message: "API is healthy",
    timestamp: new Date().toISOString()
  });
});

app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

export default app;
