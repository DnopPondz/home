export const runtime = "nodejs"

export async function POST(req) {
  try {
    return new Response(
      JSON.stringify({
        message: "Logout success",
        redirectTo: "/page/login", // redirect ไปหน้า login หลัง logout
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error("Logout Error:", error)
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 })
  }
}
