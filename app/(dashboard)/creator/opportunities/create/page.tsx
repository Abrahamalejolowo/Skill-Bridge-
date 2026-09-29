'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Zap, 
  Edit2, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Crown, 
  Lock, 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Link as LinkIcon,
  ChevronLeft,
  Plus,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { getPremiumStatus } from '@/app/actions/chat'

type Mode = 'mode-select' | 'ai-prompt' | 'manual-form' | 'success'

const EDUCATION_LEVELS = ['High School', 'Undergraduate', 'Graduate', 'Postgraduate']

const inputClass =
  'w-full px-4 py-3 border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-sm shadow-sm'

const emptyForm = {
  title: '',
  type: 'internship',
  shortDescription: '',
  description: '',
  requirements: [''],
  skillsNeeded: [''],
  location: '',
  remote: true,
  compensation: '',
  durationMonths: '',
  officialUrl: '',
  deadline: '',
  educationLevels: [] as string[],
}

export default function CreateOpportunityPage() {
  const [mode, setMode] = useState<Mode>('mode-select')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [fromAI, setFromAI] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    getPremiumStatus().then((res) => setIsPremium(res.isPremium))
  }, [])

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (
    field: 'requirements' | 'skillsNeeded',
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  const addArrayField = (field: 'requirements' | 'skillsNeeded') => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }))
  }

  const removeArrayField = (field: 'requirements' | 'skillsNeeded', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const toggleEducationLevel = (level: string) => {
    setFormData((prev) => ({
      ...prev,
      educationLevels: prev.educationLevels.includes(level)
        ? prev.educationLevels.filter((l) => l !== level)
        : [...prev.educationLevels, level],
    }))
  }

  const goBack = () => {
    if (fromAI) {
      setMode('ai-prompt')
    } else {
      setMode('mode-select')
    }
  }

  const handleAICardClick = () => {
    if (isPremium === false) {
      router.push('/premium')
      return
    }
    setFromAI(false)
    setMode('ai-prompt')
  }

  const generateWithAI = async () => {
    if (aiPrompt.trim().length < 20) {
      toast.error('Please describe the opportunity in a bit more detail')
      return
    }

    setAiLoading(true)
    try {
      const response = await fetch('/api/opportunities/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 403 && data.premiumRequired) {
          toast.error('AI-powered creation requires Premium')
          router.push('/premium')
          return
        }
        throw new Error(data.error || 'Generation failed')
      }

      const o = data.opportunity

      setFormData({
        ...emptyForm,
        title: o.title || '',
        type: o.type || 'internship',
        shortDescription: o.shortDescription || '',
        description: o.description || '',
        requirements: o.requirements?.length ? o.requirements : [''],
        skillsNeeded: o.skillsNeeded?.length ? o.skillsNeeded : [''],
        location: o.location || '',
        remote: Boolean(o.remote),
        compensation: o.compensation || '',
        durationMonths: o.durationMonths ? String(o.durationMonths) : '',
      })

      setFromAI(true)
      setMode('manual-form')
      toast.success('Draft ready — review it and add your application link')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate opportunity'
      console.error('AI generation error:', error)
      toast.error(message)
    } finally {
      setAiLoading(false)
    }
  }

  const saveOpportunity = async () => {
    setFormLoading(true)
    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          durationMonths: formData.durationMonths ? parseInt(formData.durationMonths, 10) : null,
        }),
      })

      const text = await response.text()
      let data: any = {}
      try {
        data = JSON.parse(text)
      } catch {
        // Not JSON
      }

      if (!response.ok) {
        throw new Error(data.error || `Server returned ${response.status}.`)
      }

      setMode('success')
      setTimeout(() => {
        router.push('/creator/opportunities')
      }, 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save opportunity'
      toast.error(message)
    } finally {
      setFormLoading(false)
    }
  }

  // 1. Mode Select View
  if (mode === 'mode-select') {
    return (
      <div className="min-h-[85vh] p-6 sm:p-10 flex flex-col justify-center max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Sparkles className="size-3.5" />
            Creator Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extxl font-bold tracking-tight text-foreground font-serif">
            Create an Opportunity
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Choose how you would like to publish your role and connect with top tech talent.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto w-full">
          {/* AI Mode Card */}
          <button
            onClick={handleAICardClick}
            className="group relative text-left rounded-3xl border border-border/80 bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/50 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-transform duration-300 group-hover:scale-110 pointer-events-none" />

            {isPremium === false && (
              <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 text-xs font-bold border border-amber-500/20 shadow-sm">
                <Crown className="size-3.5" />
                PRO
              </span>
            )}

            <div>
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 shadow-inner transition-transform group-hover:scale-105">
                {isPremium === false ? (
                  <Lock className="size-6" />
                ) : (
                  <Zap className="size-6" />
                )}
              </div>

              <h2 className="text-xl font-bold text-foreground font-serif">AI-Powered Creation</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Describe the role in natural language and let our intelligent assistant structure the complete listing.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
              {isPremium === false ? 'Unlock with Pro' : 'Start with AI'}
              <ArrowRight className="size-4" />
            </div>
          </button>

          {/* Manual Mode Card */}
          <button
            onClick={() => {
              setFromAI(false)
              setFormData(emptyForm)
              setMode('manual-form')
            }}
            className="group relative text-left rounded-3xl border border-border/80 bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-accent-foreground/30 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full transition-transform duration-300 group-hover:scale-110 pointer-events-none" />

            <div>
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-accent/25 text-accent-foreground mb-6 shadow-inner transition-transform group-hover:scale-105">
                <Edit2 className="size-6" />
              </div>

              <h2 className="text-xl font-bold text-foreground font-serif">Manual Entry</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Have a precise description ready? Build your listing manually from scratch using our structured form.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-foreground group-hover:translate-x-1 transition-transform">
              Start Manual Form
              <ArrowRight className="size-4" />
            </div>
          </button>
        </div>
      </div>
    )
  }

  // 2. AI Prompt View
  if (mode === 'ai-prompt') {
    return (
      <div className="p-6 md:p-12 max-w-2xl mx-auto">
        <button
          onClick={() => setMode('mode-select')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ChevronLeft className="size-4" />
          Back to options
        </button>

        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Zap className="size-3.5" />
            AI Draft Assistant
          </div>
          <h1 className="text-3xl font-bold text-foreground font-serif">Describe Your Opportunity</h1>
          <p className="text-sm text-muted-foreground">
            Share details like responsibilities, tech stack, duration, and whether it is remote.
          </p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Role Prompt Description
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., We need a junior React developer intern for 3 months to help build our customer dashboard. Must know JavaScript, Tailwind, and basic git workflows. Fully remote role with mentorship provided."
              className="h-48 w-full resize-none rounded-xl border border-border/80 bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: The more detailed your description, the more accurate the generated draft will be.
            </p>
          </div>

          <button
            onClick={generateWithAI}
            disabled={aiLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 px-6 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50 text-sm"
          >
            {aiLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating AI Draft...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate Opportunity Draft
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // 3. Manual Form & AI Review Form
  if (mode === 'manual-form') {
    return (
      <div className="p-6 md:p-12 max-w-3xl mx-auto">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ChevronLeft className="size-4" />
          Back
        </button>

        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-foreground font-serif">
            {fromAI ? 'Review AI-Generated Draft' : 'Create Opportunity Listing'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {fromAI
              ? 'Our AI drafted this based on your notes. Review, adjust fields, and add your application link.'
              : 'Fill in the structured criteria below to publish your listing.'}
          </p>
        </div>

        {fromAI && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-primary">
            <Sparkles className="size-5 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium">
              Generated successfully. Please double-check all details before publishing your live listing.
            </p>
          </div>
        )}

        <div className="space-y-8 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/50 pb-2">
              <Briefcase className="size-3.5 text-primary" />
              General Information
            </h3>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Opportunity Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="e.g., Frontend React Engineering Intern"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Opportunity Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className={inputClass}
                >
                  <option value="internship">Internship</option>
                  <option value="job">Job</option>
                  <option value="project">Project</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="mentorship">Mentorship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Duration (Months)
                </label>
                <input
                  type="number"
                  value={formData.durationMonths}
                  onChange={(e) => handleFormChange('durationMonths', e.target.value)}
                  min="1"
                  placeholder="e.g., 3"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Short One-Liner Summary <span className="text-destructive">*</span>
              </label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => handleFormChange('shortDescription', e.target.value)}
                placeholder="Brief summary displayed on opportunity preview cards..."
                className="h-20 w-full resize-none rounded-xl border border-border/80 bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Full Description & Responsibilities
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Detailed outline of expectations, daily tasks, and what the candidate will learn..."
                className="h-32 w-full resize-none rounded-xl border border-border/80 bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
              />
            </div>
          </div>

          {/* Section 2: Logistics & Application Link */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/50 pb-2">
              <MapPin className="size-3.5 text-primary" />
              Logistics & External Link
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Application Link / URL <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <LinkIcon className="size-4" />
                  </div>
                  <input
                    type="url"
                    value={formData.officialUrl}
                    onChange={(e) => handleFormChange('officialUrl', e.target.value)}
                    placeholder="https://company.com/apply"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Application Deadline
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Calendar className="size-4" />
                  </div>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleFormChange('deadline', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  placeholder="e.g., Lagos, Nigeria"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Compensation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <DollarSign className="size-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.compensation}
                    onChange={(e) => handleFormChange('compensation', e.target.value)}
                    placeholder="e.g., ₦60,000 / month or Unpaid"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 pt-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={formData.remote}
                onChange={(e) => handleFormChange('remote', e.target.checked)}
                className="size-4 rounded accent-primary border-border"
              />
              <span className="text-sm font-semibold text-foreground">This is a Remote position</span>
            </label>
          </div>

          {/* Section 3: Targeting Eligibility */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
              Eligibility & Targeting
            </h3>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                Who can apply?
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Select target education levels or leave all unchecked to open to everyone.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {EDUCATION_LEVELS.map((level) => {
                  const selected = formData.educationLevels.includes(level)
                  return (
                    <button
                      type="button"
                      key={level}
                      onClick={() => toggleEducationLevel(level)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition border ${
                        selected
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-background text-foreground border-border hover:bg-muted/60'
                      }`}
                    >
                      {level} {selected && '✓'}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Skills & Requirements */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
              Requirements & Skills
            </h3>

            {/* Skills Needed */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">
                Required Skills
              </label>
              <div className="space-y-2.5">
                {formData.skillsNeeded.map((skill, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('skillsNeeded', idx, e.target.value)}
                      placeholder="e.g., React, TypeScript, Tailwind CSS"
                      className={inputClass}
                    />
                    {formData.skillsNeeded.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('skillsNeeded', idx)}
                        className="px-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition flex items-center justify-center"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayField('skillsNeeded')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition pt-1"
              >
                <Plus className="size-3.5" />
                Add Skill
              </button>
            </div>

            {/* Requirements list */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">
                Candidate Requirements
              </label>
              <div className="space-y-2.5">
                {formData.requirements.map((req, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleArrayChange('requirements', idx, e.target.value)}
                      placeholder="e.g., Enrolled in a degree program or bootcamp graduate"
                      className={inputClass}
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('requirements', idx)}
                        className="px-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition flex items-center justify-center"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayField('requirements')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition pt-1"
              >
                <Plus className="size-3.5" />
                Add Requirement
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/80">
            <button
              type="button"
              onClick={goBack}
              className="w-full sm:flex-1 rounded-xl border border-border py-3.5 px-6 font-semibold text-foreground transition hover:bg-muted text-sm"
            >
              Back
            </button>
            <button
              type="button"
              onClick={saveOpportunity}
              disabled={
                formLoading ||
                !formData.title.trim() ||
                !formData.shortDescription.trim() ||
                !formData.officialUrl.trim()
              }
              className="w-full sm:flex-1 rounded-xl bg-primary py-3.5 px-6 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none text-sm flex items-center justify-center gap-2"
            >
              {formLoading && <Loader2 className="size-4 animate-spin" />}
              {formLoading ? 'Publishing Listing...' : 'Publish Opportunity'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 4. Success State
  return (
    <div className="flex min-h-[75vh] items-center justify-center p-6">
      <div className="text-center max-w-md space-y-4">
        <div className="mx-auto inline-flex size-20 items-center justify-center rounded-3xl bg-primary/15 text-primary shadow-inner animate-bounce">
          <CheckCircle2 className="size-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">Opportunity Published!</h1>
        <p className="text-sm text-muted-foreground">
          Your listing is now live on SkillBridge. Redirecting you to your opportunities workspace...
        </p>
      </div>
    </div>
  )
}