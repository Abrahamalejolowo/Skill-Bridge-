'use client'

import { FormEvent, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import web from "@/public/web.jpeg"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(authError || '')
  const [pending, setPending] = useState(false)
  const [debugLog, setDebugLog] = useState<string[]>([])

  const addLog = (msg: string) => {
    console.log(msg)
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
  }

  async function handleGoogleLogin() {
    try {
      addLog('🔵 Google login clicked')
      setPending(true)
      setError('')

      addLog('📱 Creating Supabase client...')
      const supabase = createClient()

      addLog('🔐 Initiating OAuth with Google...')

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (oauthError) {
        addLog(` OAuth Error: ${oauthError.message}`)
        setError(`OAuth Error: ${oauthError.message}`)
        setPending(false)
      } else {
        addLog(' OAuth initiated, redirecting to Google...')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      addLog(` Catch Error: ${errorMsg}`)
      setError(`Error: ${errorMsg}`)
      setPending(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')

    try {
      const supabase = createClient()
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setPending(false)
      } else {
        await new Promise(resolve => setTimeout(resolve, 500))
        window.location.href = '/dashboard'
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      setError(errorMsg)
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-between p-8">
        <div className="bg-[#F0EBE1] p-1 rounded-full flex text-xs font-medium shadow-inner">
          <Link
            href="/sign-up"
            className="px-6 py-2 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
          >
            Sign Up
          </Link>
          <span className="px-6 py-2 rounded-full bg-white text-slate-900 shadow-sm">
            Log In
          </span>
        </div>

        <div className="w-full max-w-sm space-y-6 my-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back!</h1>
            <p className="text-[11px] text-slate-400">
              Enter your credentials to access your account.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={pending}
            className="w-full h-10 border border-amber-200/80 bg-white rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-slate-700 hover:bg-amber-50/50 transition-all shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {pending ? 'Loading...' : 'Continue With Google'}
          </button>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-800">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={pending}
                placeholder="you@example.com"
                className="w-full h-10 px-3.5 rounded-xl border border-amber-200/80 bg-white focus:outline-none focus:ring-2 focus:ring-[#D9822B] text-xs text-slate-800 placeholder:text-slate-300 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-800">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
                placeholder="Enter your password"
                className="w-full h-10 px-3.5 rounded-xl border border-amber-200/80 bg-white focus:outline-none focus:ring-2 focus:ring-[#D9822B] text-xs text-slate-800 placeholder:text-slate-300 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={pending}
                className="px-6 py-2 rounded-xl bg-[#E2A03F] hover:bg-[#d49132] text-white font-medium text-xs transition-all shadow-sm disabled:opacity-50"
              >
                {pending ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>
        </div>

        {debugLog.length > 0 && (
          <div className="w-full max-w-sm mt-8 p-4 bg-slate-100 rounded-lg border border-slate-300">
            <p className="text-xs font-bold text-slate-900 mb-2">Debug Logs:</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {debugLog.map((log, i) => (
                <p key={i} className="text-xs text-slate-700 font-mono">{log}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="hidden lg:block w-1/2 relative min-h-screen">
        <Image
          src={web}
          alt="People working together"
          fill
          className="object-cover"
          priority
        />
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs text-slate-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}