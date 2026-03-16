const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function corsJson(data: unknown, init?: { status?: number }) {
  return Response.json(data, {
    status: init?.status,
    headers: corsHeaders,
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
