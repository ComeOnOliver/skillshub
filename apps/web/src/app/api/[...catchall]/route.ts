import { corsJson, OPTIONS as corsOptions } from "@/lib/api-cors";

function notFound() {
  return corsJson(
    {
      error: {
        code: "NOT_FOUND",
        message: "API version not found. Use /api/v1 for documentation.",
      },
    },
    { status: 404 },
  );
}

export async function GET() { return notFound(); }
export async function POST() { return notFound(); }
export async function PUT() { return notFound(); }
export async function DELETE() { return notFound(); }
export async function PATCH() { return notFound(); }

export { corsOptions as OPTIONS };
