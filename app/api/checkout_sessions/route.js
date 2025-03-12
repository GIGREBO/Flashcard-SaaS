import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})

// Utility function to format the amount for Stripe (in cents)
const formatAmountForStripe = (amount, currency) => {
  return Math.round(amount * 100)
}

// POST: Create a new checkout session
export async function POST(req) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('Origin') || req.headers.get('Referer') || 'http://localhost:3000';
    
    const params = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Pro subscription',
            },
            unit_amount: formatAmountForStripe(10, 'usd'),
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/result?session_id={CHECKOUT_SESSION_ID}`,
    }

    const checkoutSession = await stripe.checkout.sessions.create(params)
    return NextResponse.json(checkoutSession)
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }
}

// GET: Retrieve session details after payment
export async function GET(req) {
  const searchParams = req.nextUrl.searchParams
  const session_id = searchParams.get('session_id')

  try {
    if (!session_id) {
      throw new Error('Session ID is required')
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id)

    return NextResponse.json(checkoutSession)
  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }
}
