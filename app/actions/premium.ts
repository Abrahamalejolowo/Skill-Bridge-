'use server'

import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

const BASE_PRICE_NGN = 5000
const PENDING_EXPIRY_MINUTES = 30
const PREMIUM_DURATION_DAYS = 30

type InitiateResult =
  | {
      success: true
      accountNumber: string
      bankName: string
      accountName: string
      amount: number
      reference: string
      expiresAt: string
    }
  | { success: false; error: string }

export async function initiatePremiumPayment(): Promise<InitiateResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const accountNumber = process.env.BMONI_ACCOUNT_NUMBER
  const bankName = process.env.BMONI_BANK_NAME
  const accountName = process.env.BMONI_ACCOUNT_NAME

  if (!accountNumber || !bankName || !accountName) {
    return { success: false, error: 'Payment account is not configured yet.' }
  }

  let amount = BASE_PRICE_NGN
  let attempts = 0

  while (attempts < 5) {
    const koboOffset = Math.floor(Math.random() * 99) + 1
    const candidate = Number((BASE_PRICE_NGN + koboOffset / 100).toFixed(2))

    const { data: collision } = await supabase
      .from('profiles')
      .select('id')
      .eq('bmoni_pending_amount', candidate)
      .gt('bmoni_pending_created_at', new Date(Date.now() - PENDING_EXPIRY_MINUTES * 60_000).toISOString())
      .maybeSingle()

    if (!collision) {
      amount = candidate
      break
    }
    attempts++
  }

  const reference = `SB-${user.id.slice(0, 8)}-${randomUUID().slice(0, 6)}`

  const { error } = await supabase
    .from('profiles')
    .update({
      bmoni_pending_amount: amount,
      bmoni_pending_reference: reference,
      bmoni_pending_created_at: new Date().toISOString(),
      payment_verified: false,
      payment_seen: false,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to record pending BMONI payment:', error)
    return { success: false, error: 'Could not start payment. Please try again.' }
  }

  const expiresAt = new Date(Date.now() + PENDING_EXPIRY_MINUTES * 60_000).toISOString()

  return {
    success: true,
    accountNumber,
    bankName,
    accountName,
    amount,
    reference,
    expiresAt,
  }
}

export async function notifyPaymentMade() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      payment_seen: true, // Marks as reported by the user
    })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: 'Failed to update payment status.' }
  }

  return { success: true }
}

export async function getAccountType(): Promise<'student' | 'creator'> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return 'student'

  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return creator ? 'creator' : 'student'
}

export async function getPremiumPageStatus() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { isPremium: false, expiresAt: null, dashboardPath: '/dashboard', pending: null }

  const [{ data }, { data: creator }] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'is_premium, premium_expires_at, bmoni_pending_amount, bmoni_pending_reference, bmoni_pending_created_at, payment_seen, payment_verified'
      )
      .eq('id', user.id)
      .maybeSingle(),
    supabase.from('creator_profiles').select('user_id').eq('user_id', user.id).maybeSingle(),
  ])

  const dashboardPath = creator ? '/creator' : '/dashboard'

  // If you toggle payment_verified to true in Supabase, this auto-grants
  // premium and notifies the user exactly once.
  if (data?.payment_verified && !data?.is_premium) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + PREMIUM_DURATION_DAYS)

    await supabase
      .from('profiles')
      .update({
        is_premium: true,
        premium_expires_at: expiresAt.toISOString(),
      })
      .eq('id', user.id)

    data.is_premium = true
    data.premium_expires_at = expiresAt.toISOString()

    // Guard against duplicate notifications if this function is called
    // again before the updated `is_premium` value has been refetched.
    const { data: existingNotification } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('kind', 'premium_activated')
      .maybeSingle()

    if (!existingNotification) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Payment confirmed — AI Advisor is now active',
        message:
          "We've confirmed your payment. Your AI Advisor is unlocked and ready to use right away.",
        kind: 'premium_activated',
      })
    }
  }

  const pendingActive =
    data?.bmoni_pending_amount &&
    data?.bmoni_pending_created_at &&
    new Date(data.bmoni_pending_created_at).getTime() + PENDING_EXPIRY_MINUTES * 60_000 > Date.now()

  return {
    isPremium: !!data?.is_premium,
    expiresAt: data?.premium_expires_at || null,
    dashboardPath,
    pending: pendingActive
      ? {
          amount: data!.bmoni_pending_amount,
          reference: data!.bmoni_pending_reference,
          accountNumber: process.env.BMONI_ACCOUNT_NUMBER,
          bankName: process.env.BMONI_BANK_NAME,
          accountName: process.env.BMONI_ACCOUNT_NAME,
          paymentSeen: !!data!.payment_seen,
          paymentVerified: !!data!.payment_verified,
        }
      : null,
  }
}