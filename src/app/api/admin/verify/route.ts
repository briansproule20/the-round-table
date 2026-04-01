export async function POST(request: Request) {
  const { password } = await request.json()

  const isValid = password === process.env.ADMIN_PASSWORD

  return Response.json({ success: isValid })
}
