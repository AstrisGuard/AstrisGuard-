
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { scanTokenActivity } from "@/routines/background-jobs/token-flow/solanaTokenActivityDetector"

const QuerySchema = z.object({
  token: z.string().min(32).max(64)
})

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parse = QuerySchema.safeParse(params)

  if (!parse.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parse.error.issues },
      { status: 400 }
    )
  }

  const { token } = parse.data

  try {
    const result = await scanTokenActivity(token)
    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error("Token scan error:", err)
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    )
  }
}
