import "koa";

declare module "koa" {
    interface Request {
        body?: any;
    }
}

// Koa doesn't define ctx.request.body in its type system, so we need to extend the Request interface to include it. This allows us to access ctx.request.body without TypeScript errors.
