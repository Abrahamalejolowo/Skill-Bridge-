'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Building2, AlertCircle, Clock, Home } from 'lucide-react'
import { toast } from 'sonner'

export default function CreatorSignInPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'input' | 'checking'>('input')
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setStatus('checking')

    try {
      const response = await fetch('/api/creator/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.verification_status === 'pending') {
          setStatus('input')
          toast.info('Account verification pending. Please wait for admin approval.')
          return
        }

        if (data.verification_status === 'rejected') {
          setStatus('input')
          toast.error(`Account rejected: ${data.rejection_reason || 'Please contact support.'}`)
          return
        }

        throw new Error(data.error || `Sign in failed with status ${response.status}`)
      }

      toast.success('Welcome back! Redirecting to dashboard...')
      router.push('/creator')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error(message)
      setStatus('input')
    } finally {
      setLoading(false)
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
              <Building2 className="size-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Creator Portal Login</h1>
            <p className="text-muted-foreground text-sm mt-1.5">Sign in to manage your opportunities</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Organization Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@organization.com"
                disabled={loading}
                className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <Link
                  href="/auth/creator/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-2.5 items-center">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Pending Status Messages */}
            {status === 'checking' && (
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3 items-center">
                <Clock className="size-4 text-primary shrink-0 animate-spin" />
                <div>
                  <p className="font-semibold text-xs text-primary">Checking account status...</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Please wait while we verify your account.</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/80" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-card text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  New creator?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link
              href="/auth/creator/sign-up"
              className="block w-full border border-border/80 text-foreground py-3 rounded-2xl font-semibold hover:bg-muted/50 transition-colors text-center text-sm"
            >
              Create Creator Account
            </Link>

            {/* Student Link */}
            <div className="text-center text-sm pt-4 border-t border-border/50">
              <span className="text-muted-foreground">Are you a student? </span>
              <Link href="/sign-in" className="text-primary font-medium hover:underline">
                Student Sign In
              </Link>
            </div>
          </form>

          {/* Info Section */}
          <div className="mt-6 p-4 rounded-2xl bg-muted/30 border border-border/80">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Verification Notice:</strong> Organization accounts require team approval before full dashboard access is granted (typically 1-2 hours).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}