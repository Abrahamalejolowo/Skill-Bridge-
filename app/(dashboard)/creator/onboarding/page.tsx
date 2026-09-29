'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader,
  Clock,
  Building2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function CreatorOnboardingPage() {
  const [user, setUser] = useState<any>(null)
  const [creator, setCreator] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: 'company',
    description: '',
    website: '',
    industry: '',
    location: '',
    contactPersonName: '',
    contactEmail: '',
    contactPhone: '',
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/creator/sign-in')
        return
      }

      setUser(user)

      // Get creator profile
      const { data: creatorData } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (creatorData) {
        setCreator(creatorData)

        // If already verified, redirect to dashboard
        if (creatorData.verification_status === 'verified') {
          router.push('/creator')
          return
        }

        // If rejected, show rejection message
        if (creatorData.verification_status === 'rejected') {
          setError(creatorData.rejection_reason || 'Your account has been rejected.')
          return
        }

        // Pre-fill form data
        if (creatorData.organization_name) {
          setFormData({
            organizationName: creatorData.organization_name || '',
            organizationType: creatorData.organization_type || 'company',
            description: creatorData.description || '',
            website: creatorData.website || '',
            industry: creatorData.industry || '',
            location: creatorData.location || '',
            contactPersonName: creatorData.contact_person_name || '',
            contactEmail: creatorData.contact_email || user.email,
            contactPhone: creatorData.contact_phone || '',
          })
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      router.push('/auth/creator/sign-in')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.organizationName || !formData.contactEmail) {
      setError('Organization name and contact email are required')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/creator/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit onboarding')
      }

      setSuccess(true)
      toast.success('Onboarding completed! Waiting for verification...')

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/auth/creator/verification-pending')
      }, 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B6E52] mx-auto mb-4" />
          <p className="text-[#64748B]">Loading...</p>
        </div>
      </div>
    )
  }

  if (creator?.verification_status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFDF7] to-[#FAF8EE] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
              <AlertCircle className="size-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Account Rejected</h1>
            <p className="text-[#64748B] mt-4">{error}</p>
            <div className="mt-6 space-y-3">
              <Link
                href="/auth/creator/sign-up"
                className="block w-full bg-[#3B6E52] text-white py-3 rounded-lg font-semibold hover:bg-[#2F5942] transition"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="block w-full border border-[#E2E8F0] text-[#1E293B] py-3 rounded-lg font-semibold hover:bg-[#F8FAFC] transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFDF7] to-[#FAF8EE] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-6 animate-pulse">
              <Clock className="size-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Pending Verification</h1>
            <p className="text-[#64748B] mt-4">
              Thank you for completing your onboarding! Your account is now pending verification by our team.
            </p>
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-xs text-blue-800 mt-2 space-y-1">
                <li>✓ Admin review (1-2 hours)</li>
                <li>✓ Verification email sent</li>
                <li>✓ Access to dashboard</li>
              </ul>
            </div>
            <p className="text-xs text-[#64748B] mt-6">
              Taking you to your verification status page...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF7] to-[#FAF8EE] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#E59832] text-white mb-4">
            <Building2 className="size-6" />
          </div>
          <h1 className="text-4xl font-bold text-[#1E293B]">Complete Your Profile</h1>
          <p className="text-[#64748B] mt-2">Tell us about your organization</p>
        </div>

        {/* Verification Info */}
        {creator?.verification_status === 'pending' && (
          <div className="mb-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex gap-3">
            <Clock className="size-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Account Verification Pending</p>
              <p className="text-sm text-yellow-800 mt-1">
                Your account is waiting for admin verification. You can update your profile information below.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-8 space-y-6">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              placeholder="e.g., TechCorp Inc."
              required
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#3B6E52] focus:ring-2 focus:ring-[#3B6E52]/10 outline-none transition"
            />
          </div>

          {/* Organization Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                Organization Type
              </label>
              <select
                value={formData.organizationType}
                onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#3B6E52] focus:ring-2 focus:ring-[#3B6E52]/10 outline-none transition"
              >
                <option value="company">Company</option>
                <option value="university">University</option>
                <option value="nonprofit">Non-Profit</option>
                <option value="foundation">Foundation</option>
                <option value="government">Government</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Technology"
                className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#3B6E52] focus:ring-2 focus:ring-[#3B6E52]/10 outline-none transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">
              Organization Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about your organization..."
              rows={4}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#3B6E52] focus:ring-2 focus:ring-[#3B6E52]/10 outline-none transition resize-none"
            />
          </div>

          {/* Website & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#3B6E52] focus:ring-2 focus:ring-[#3B6E52]/10 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
                className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#3B6E52] focus:ring-2 focus:ring-[#3B6E52]/10 outline-none transition"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-[#E2E8F0] pt-6">
            <h3 className="font-semibold text-[#1E293B] mb-4">Contact Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-2">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={formData.contactPersonName}
                  onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#3B6E52] focus:ring-2 focus:ring-[#3B6E52]/10 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#3B6E52] focus:ring-2 focus:ring-[#3B6E52]/10 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:border-[#3B6E52] focus:ring-2 focus:ring-[#3B6E52]/10 outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-[#FEF6E6] border border-[#F2D7A5] rounded-lg p-4">
            <p className="text-sm text-[#B37019]">
              <strong>📋 Next Step:</strong> After you submit this form, your account will be reviewed by our team. You'll receive an email when your account is verified.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#3B6E52] text-white py-3 rounded-lg font-semibold hover:bg-[#2F5942] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader className="size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit for Verification
                <ArrowRight className="size-4" />
              </>
            )}
          </button>

          {/* Logout Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/')
              }}
              className="text-sm text-[#64748B] hover:text-[#1E293B]"
            >
              Not ready? Sign out
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}