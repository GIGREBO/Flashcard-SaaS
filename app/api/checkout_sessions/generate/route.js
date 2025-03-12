import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const systemPrompt = `
You are a flashcard creator, you take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards.
Both front and back should be one sentence long.
You should return in the following JSON format:
{
  "flashcards":[
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}
`

export async function POST(req) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    const data = await req.text()
    
    if (!data || data.trim().length === 0) {
      return NextResponse.json({ error: { message: 'No input text provided' } }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: data },
      ],
      model: 'gpt-4',
    })

    try {
      const flashcards = JSON.parse(completion.choices[0].message.content)
      return NextResponse.json(flashcards.flashcards)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return NextResponse.json(
        { error: { message: 'Failed to parse flashcards response' } },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error generating flashcards:', error)
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }
}