import type { ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(err);
  const status = "status" in err ? (err as any).status : 500;
  return c.json(
    {
      error: {
        code: status === 404 ? "NOT_FOUND" : "INTERNAL_ERROR",
        message: err.message || "Internal server error",
      },
    },
    status
  );
};
