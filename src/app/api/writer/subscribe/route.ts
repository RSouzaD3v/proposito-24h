import { NextResponse } from "next/server";

/**
 * @deprecated Use POST /api/asaas/writer-subscription
 */
export async function POST() {
  return NextResponse.json(
    { error: "Endpoint descontinuado. Use POST /api/asaas/writer-subscription" },
    { status: 410 }
  );
}
