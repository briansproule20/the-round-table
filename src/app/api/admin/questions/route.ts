import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const { member_id, password, question_text, options, correct_index, order } =
    await request.json()

  if (!member_id || !password) {
    return Response.json({ error: "Missing credentials" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify per-member password
  const { data: member } = await supabase
    .from("members")
    .select("id, admin_password")
    .eq("id", member_id)
    .single()

  if (!member || member.admin_password !== password) {
    return Response.json({ error: "Invalid password for this member" }, { status: 401 })
  }

  if (!question_text || !options || correct_index === undefined || !order) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  const { error } = await supabase.from("questions").upsert(
    {
      member_id,
      question_text,
      options,
      correct_index,
      order,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "member_id,order" }
  )

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
