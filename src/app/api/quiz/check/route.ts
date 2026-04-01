import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const { question_id, selected_index } = await request.json()

  if (!question_id || selected_index === undefined || selected_index === null) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: question } = await supabase
    .from("questions")
    .select("correct_index")
    .eq("id", question_id)
    .single()

  if (!question) {
    return Response.json({ error: "Question not found" }, { status: 404 })
  }

  const correct = selected_index === question.correct_index

  return Response.json({
    correct,
    correct_index: question.correct_index,
  })
}
