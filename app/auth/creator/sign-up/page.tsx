'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Building2, AlertCircle, Mail, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function CreatorSignUpPage() {
  const [step, setStep] = useState<'info' | 'credentials' | 'check-email'>('info')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/creator/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Sign up failed with status ${response.status}`)
      }

      toast.success('Account created! Check your email to confirm.')
      setStep('check-email')
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred'
      setError(errorMsg)
      toast.error(errorMsg)
      console.error('Sign up error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/creator/onboarding`,
        },
      })

      if (error) throw error
      toast.success('Confirmation email sent again')
    } catch (err: any) {
      toast.error(err.message || 'Could not resend email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="size-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              SB
            </div>
            <span className="font-bold text-xl tracking-tight">SkillBridge</span>
          </Link>
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-3xl p-8 shadow-xl shadow-black/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-4 ring-8 ring-primary/5">
              {step === 'check-email' ? <Mail className="size-6" /> : <Building2 className="size-6" />}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {step === 'check-email' ? 'Check Your Email' : 'Creator Portal'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              {step === 'check-email'
                ? 'One more step before you can continue'
                : 'Post opportunities and connect with top talent'}
            </p>
          </div>

          {/* Step 1: Info */}
          {step === 'info' && (
            <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-primary">Account Verification Required</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      After onboarding, your organization account will be reviewed by our team (typically 1-2 hours). You'll get an email once approved.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Creator Benefits</h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Post scholarships, internships, & opportunities
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    AI-powered applicant matching & shortlisting
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Track applications, pipelines, & analytics
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Manage your verified organization profile
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setStep('credentials')}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="size-4" />
              </button>

              <div className="space-y-2.5 pt-2 text-center text-sm border-t border-border/50">
                <div>
                  <span className="text-muted-foreground">Are you a student? </span>
                  <Link href="/sign-up" className="text-primary font-medium hover:underline">
                    Student Sign Up
                  </Link>
                </div>
                <div>
                  <span className="text-muted-foreground">Already a creator? </span>
                  <Link href="/auth/creator/sign-in" className="text-primary font-medium hover:underline">
                    Creator Login
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === 'credentials' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Organization Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@organization.com"
                  className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                />
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-2.5 items-center">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {loading ? 'Creating Account...' : 'Create Creator Account'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="w-full border border-border/80 text-foreground py-3 rounded-2xl font-semibold hover:bg-muted/50 transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground text-center pt-2">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
              </p>
            </form>
          )}

          {/* Step 3: Check email */}
          {step === 'check-email' && (
            <div className="space-y-6 text-center">
              <div className="bg-muted/30 border border-border/80 rounded-2xl p-5">
                <p className="text-sm text-muted-foreground">
                  We sent a confirmation link to
                </p>
                <p className="text-sm font-semibold mt-1 break-all text-primary">
                  {formData.email}
                </p>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  Click the link in that email to verify your email address and continue to organization onboarding.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full border border-border/80 text-foreground py-3 rounded-2xl font-semibold hover:bg-muted/50 disabled:opacity-50 transition-colors text-sm"
                >
                  {resending ? 'Sending...' : "Didn't get it? Resend email"}
                </button>
              </div>

              <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                Already confirmed?{' '}
                <Link href="/auth/creator/sign-in" className="text-primary font-medium hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}