import { createLog } from "@/lib/logs";

export async function POST(request: Request) {
  const body = await request.json();

  await createLog({
    level: body.level,
    context: body.context,
    message: body.message,
    metadata: body.metadata,
  });

  return Response.json({ ok: true });
}
