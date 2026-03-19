import type { ZodError } from "zod";

export function formatZodError(error: ZodError): string {
  return error.issues
    .map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message))
    .join("; ");
}

const ALLOWED_ORIGINS = [
  "https://skillshub.wtf",
  "https://www.skillshub.wtf",
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

const readCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function getWriteCorsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("Origin") ?? "";
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return { "Vary": "Origin" };
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

/** CORS response for read-only (GET) endpoints — open to all origins */
export function corsJson(data: unknown, init?: { status?: number; headers?: Record<string, string> }) {
  return Response.json(data, {
    status: init?.status,
    headers: { ...readCorsHeaders, ...init?.headers },
  });
}

/** CORS response for write (POST/PUT/DELETE) endpoints — restricted origins */
export function writeCorsJson(data: unknown, request: Request, init?: { status?: number }) {
  return Response.json(data, {
    status: init?.status,
    headers: getWriteCorsHeaders(request),
  });
}

export function methodNotAllowed(allowed: string[]) {
  return new Response(
    JSON.stringify({ error: { code: "METHOD_NOT_ALLOWED", message: `Method not allowed. Use ${allowed.join(", ")} for this endpoint.` } }),
    {
      status: 405,
      headers: {
        ...readCorsHeaders,
        "Content-Type": "application/json",
        "Allow": allowed.join(", "),
      },
    }
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: readCorsHeaders });
}

/** OPTIONS preflight for write endpoints — permissive so browsers can proceed;
 *  actual origin restriction is enforced on the write response itself. */
export function writeOPTIONS(request: Request) {
  const origin = request?.headers.get("Origin") ?? "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Vary": "Origin",
      },
    });
  }
  // For non-whitelisted origins (API consumers), return open CORS on preflight
  // The actual write endpoints still enforce origin restrictions on responses
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
