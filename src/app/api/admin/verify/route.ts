import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const { member_id, password } = await request.json()

  if (!member_id || !password) {
    return Response.json({ error: "Missing member_id or password" }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: member } = await supabase
    .from("members")
    .select("id, admin_password")
    .eq("id", member_id)
    .single()

  if (!member || member.admin_password !== password) {
    return Response.json({ success: false })
  }

  return Response.json({ success: true, member_id: member.id })
}
