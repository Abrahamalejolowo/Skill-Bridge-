import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PREMIUM_DURATION_DAYS = 30

function isValidSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

  if (signatureHeader.length !== expected.length) return false

  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected))
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('X-Webhook-Signature')
  const eventId = req.headers.get('X-Webhook-Id')

  const secret = process.env.BMONI_WEBHOOK_SECRET
  if (!secret || !isValidSignature(rawBody, signature, secret)) {
    console.error('BMONI webhook: invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  // Deduplicate on id — BMONI redelivers on retry
  const idToRecord = eventId || event.id
  const { error: dedupeError } = await supabaseAdmin
    .from('bmoni_webhook_events')
    .insert({ event_id: idToRecord })

  if (dedupeError) {
    // Unique violation means we've already processed this event — ack and stop
    if (dedupeError.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true })
    }
    console.error('BMONI webhook: dedupe insert failed', dedupeError)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  if (event.eventType !== 'employee.deposit.completed') {
    return NextResponse.json({ received: true })
  }

  const depositedAmount = Number(event.payload?.amount)

  if (!depositedAmount || Number.isNaN(depositedAmount)) {
    console.error('BMONI webhook: no valid amount in payload', event)
    return NextResponse.json({ received: true })
  }

  // Match by the unique pending amount we generated for this payment
  const { data: profile, error: findError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('bmoni_pending_amount', depositedAmount)
    .maybeSingle()

  if (findError || !profile) {
    console.error('BMONI webhook: no pending payment matches amount', depositedAmount)
    return NextResponse.json({ received: true })
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + PREMIUM_DURATION_DAYS)

  // Update profile to activate premium
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      is_premium: true,
      premium_expires_at: expiresAt.toISOString(),
      bmoni_pending_amount: null,
      bmoni_pending_reference: null,
      bmoni_pending_created_at: null,
    })
    .eq('id', profile.id)

  if (updateError) {
    console.error('BMONI webhook: failed to activate premium', updateError)
    return NextResponse.json({ error: 'Failed to activate premium' }, { status: 500 })
  }

  // Send the notification to the user's notification bar
  const { error: notifError } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: profile.id,
      title: 'Payment Verified & Premium Unlocked! 🎉',
      message: 'Your payment has been verified by the admin. Your AI career guidance and premium features are now fully active.',
      read: false,
      created_at: new Date().toISOString(),
    })

  if (notifError) {
    console.error('BMONI webhook: failed to insert notification', notifError)
    // Non-fatal, premium is already active, but good to log
  }

  return NextResponse.json({ received: true })
}