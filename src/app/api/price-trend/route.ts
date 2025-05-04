import { NextRequest, NextResponse } from 'next/server'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL!

export async function POST(req: NextRequest) {
  const body = await req.json()

  const aiRes = await fetch(`${AI_SERVICE_URL}/api/ai/price-trend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!aiRes.ok) {
    const text = await aiRes.text()
    return NextResponse.json({ error: text }, { status: aiRes.status })
  }

  const data = await aiRes.json()
  return NextResponse.json(data)
}
