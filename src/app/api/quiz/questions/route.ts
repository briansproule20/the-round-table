import { createClient } from "@supabase/supabase-js"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")

  if (!slug) {
    return Response.json({ error: "Missing slug parameter" }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: member } = await supabase
    .from("members")
    .select("id, name, slug, color, avatar_url")
    .eq("slug", slug)
    .single()

  if (!member) {
    return Response.json({ error: "Member not found" }, { status: 404 })
  }

  // Fetch questions WITHOUT correct_index -- anti-cheat
  const { data: questions } = await supabase
    .from("questions")
    .select("id, member_id, question_text, options, \"order\", created_at")
    .eq("member_id", member.id)
    .order("order")

  return Response.json({
    member,
    questions: questions ?? [],
  })
}
