import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const { password, member_id, question_text, options, correct_index, order } =
    await request.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!member_id || !question_text || !options || correct_index === undefined || !order) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin.from("questions").upsert(
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
