// frontend/src/app/api/ai/suggest-bid/route.ts
import { NextRequest, NextResponse } from 'next/server'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL! // e.g. http://localhost:8000

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Proxy the call to your Flask service
  const aiRes = await fetch(`${AI_SERVICE_URL}/api/ai/suggest-bid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!aiRes.ok) {
    const text = await aiRes.text()
    return NextResponse.json({ error: text }, { status: aiRes.status })
  }

  const data = await aiRes.json()
  return NextResponse.json(data)
}
