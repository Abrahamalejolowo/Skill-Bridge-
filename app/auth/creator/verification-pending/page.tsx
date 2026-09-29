'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type VerificationStatus = 'pending' | 'verified' | 'rejected' | null

export default function VerificationPendingPage() {
  const [status, setStatus] = useState<VerificationStatus>(null)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkCount, setCheckCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkVerificationStatus()
    
    // Poll every 5 seconds
    const interval = setInterval(() => {
      checkVerificationStatus()
      setCheckCount(prev => prev + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Not authenticated - shouldn't happen, redirect to sign in
        router.push('/auth/creator/sign-in')
        return
      }

      // Get creator profile
      const { data: profile, error } = await supabase
        .from('creator_profiles')
        .select('verification_status, rejection_reason')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error checking status:', error)
        return
      }

      if (!profile) {
        toast.error('Creator profile not found')
        router.push('/auth/creator/sign-up')
        return
      }

      // Check status
      if (profile.verification_status === 'verified') {
        setStatus('verified')
        setLoading(false)
        toast.success('Account verified! Redirecting to dashboard...')
        // Wait 1 second before redirecting so user sees success
        setTimeout(() => {
          router.push('/creator')
        }, 1000)
      } else if (profile.verification_status === 'rejected') {
        setStatus('rejected')
        setRejectionReason(profile.rejection_reason)
        setLoading(false)
        toast.error('Account rejected')
      } else {
        // Still pending
        setStatus('pending')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error checking verification:', error)
    }
  }

  // Rejected state
  if (status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFDF7] to-[#FAF8EE] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-red-100 text-red-600 mb-4">
              <AlertCircle className="size-6" />
            </div>
            <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Account Rejected</h1>
            <p className="text-[#64748B] mb-6">
              Unfortunately, your creator account application has been rejected.
            </p>

            {rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-900 font-semibold mb-1">Reason:</p>
                <p className="text-sm text-red-800">{rejectionReason}</p>
              </div>
            )}

            <div className="space-y-3">
              <a
                href="mailto:support@skillbridge.com"
                className="block w-full bg-[#3B6E52] text-white py-3 rounded-lg font-semibold hover:bg-[#2F5942] transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/auth/creator/sign-up"
                className="block w-full border border-[#E2E8F0] text-[#1E293B] py-3 rounded-lg font-semibold hover:bg-[#F8FAFC] transition-colors"
              >
                Try Again
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pending/Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF7] to-[#FAF8EE] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          {/* Icon with animation */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#E59832]/10 text-[#E59832] mb-4">
            {status === 'verified' ? (
              <CheckCircle2 className="size-6" />
            ) : (
              <Clock className="size-6 animate-spin" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
            {status === 'verified' ? 'Verified!' : 'Verification Pending'}
          </h1>

          <p className="text-[#64748B] mb-8">
            {status === 'verified'
              ? 'Your account has been verified. Redirecting to dashboard...'
              : 'Your creator account is being reviewed by our team. This typically takes 1-2 hours.'}
          </p>

          {/* Info cards */}
          <div className="space-y-3 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-900">
                <strong>What happens next:</strong> Once verified, you'll have full access to create opportunities and manage applicants.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs text-green-900">
                <strong>Tips:</strong> Keep this page open or check back later. We'll notify you when your account is ready.
              </p>
            </div>
          </div>

          {/* Check status manually */}
          {status === 'pending' && (
            <>
              <button
                onClick={checkVerificationStatus}
                className="w-full bg-[#3B6E52] text-white py-3 rounded-lg font-semibold hover:bg-[#2F5942] transition-colors mb-3"
              >
                Check Status Now
              </button>

              <p className="text-xs text-[#64748B]">
                Auto-checking every 5 seconds... ({checkCount} checks)
              </p>
            </>
          )}

          {/* Logout button */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
            <a
              href="/auth/creator/sign-in"
              className="text-sm text-[#3B6E52] hover:text-[#2F5942] font-medium"
            >
              ← Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}