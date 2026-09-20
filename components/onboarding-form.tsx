'use client'

import { useState } from 'react'
import Link from 'next/link'
import { saveProfile } from '@/app/actions/profile'
import { Send, X, Plus } from 'lucide-react'

const defaultSkills = ['JavaScript', 'Python', 'Data Analysis', 'UI/UX Design', 'Public Speaking', 'Networking', 'Writing', 'Project Management', 'Research']
const interests = ['Scholarships', 'Grants', 'Hackathons', 'Internships', 'Fellowships', 'Competitions']

export function OnboardingForm({ profile }: { profile?: any }) {
  const [step, setStep] = useState(1)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Profile States
  const [firstName, setFirstName] = useState(profile?.first_name ?? '')
  const [lastName, setLastName] = useState(profile?.last_name ?? '')
  const [institution, setInstitution] = useState(profile?.institution ?? '')
  const [educationLevel, setEducationLevel] = useState(profile?.education_level ?? '')
  const [fieldOfStudy, setFieldOfStudy] = useState(profile?.field_of_study ?? '')
  const [location, setLocation] = useState(profile?.location ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [careerGoal, setCareerGoal] = useState(profile?.career_goal ?? '')

  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile?.skills ?? [])
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests ?? [])
  const [customSkill, setCustomSkill] = useState('')

  const toggle = (value: string, set: React.Dispatch<React.SetStateAction<string[]>>) => 
    set(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value])
  
  const addSkill = () => { 
    const value = customSkill.trim() 
    if (value && !selectedSkills.includes(value)) {
      setSelectedSkills([...selectedSkills, value])
    }
    setCustomSkill('') 
  }

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skillToRemove))
  }

  const handleFinalSubmit = async (formData: FormData) => {
    setIsCalculating(true)
    setTimeout(async () => {
      await saveProfile(formData)
      setIsCalculating(false)
      setIsComplete(true)
    }, 2000)
  }

  // --- LOADING / CALCULATING STATE ---
  if (isCalculating) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col justify-between font-sans relative">
        {/* Top Progress Bar */}
        <div className="w-full px-8 pt-8 max-w-5xl mx-auto">
          <div className="w-full bg-[#EAE8E3] h-[3px] relative overflow-hidden rounded-full">
            <div className="bg-[#E5A93B] h-full absolute right-0 w-1/3 transition-all duration-500" />
          </div>
          <div className="flex justify-between items-center text-xs text-[#8A8A8E] mt-3 font-normal">
            <span>Step <strong className="text-[#1A1A1A] font-semibold">2</strong> Of 3</span>
            <span>Review</span>
          </div>
        </div>

        {/* Center Spinner & Message */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-12">
          <div className="w-14 h-14 border-[2px] border-[#E2E0D9] border-t-[#1A1A1A] rounded-full animate-spin mb-8" />
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A] tracking-tight">
            Calculating Your Readiness...
          </h2>
        </div>

        <div className="pb-8" />
      </main>
    )
  }

  // --- COMPLETION / READY STATE ---
  if (isComplete) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col justify-between font-sans relative">
        {/* Top Progress Bar */}
        <div className="w-full px-8 pt-8 max-w-5xl mx-auto">
          <div className="w-full bg-[#EAE8E3] h-[3px] relative overflow-hidden rounded-full">
            <div className="bg-[#E5A93B] h-full absolute right-0 w-1/3 transition-all duration-500" />
          </div>
          <div className="flex justify-between items-center text-xs text-[#8A8A8E] mt-3 font-normal">
            <span>Step <strong className="text-[#1A1A1A] font-semibold">2</strong> Of 3</span>
            <span>Review</span>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto -mt-12">
          <div className="w-16 h-16 rounded-full bg-[#4E7055] flex items-center justify-center text-white mb-6 shadow-sm">
            <Send className="w-7 h-7 stroke-[1.5] -translate-x-0.5 translate-y-0.5" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A] tracking-tight mb-3">
            Your Profile Is Ready.
          </h2>

          <p className="text-xs sm:text-sm text-[#707070] leading-relaxed mb-8 max-w-sm">
            We&apos;ve Matched You Against Every Opportunity In The Database.<br className="hidden sm:inline" />
            Head To Your Dashboard To See Your First Readiness Scores.
          </p>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-10 py-3 rounded-lg bg-[#E5A93B] hover:bg-[#D49830] text-white font-medium text-xs transition-all shadow-sm"
          >
            Go To My Dashboard
          </Link>
        </div>

        <div className="pb-8" />
      </main>
    )
  }

  // --- STANDARD ONBOARDING FORM ---
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-5 py-8 text-[#1A1A1A] sm:px-8 lg:px-16 font-sans">
      <div className="mx-auto max-w-4xl">
        {/* Top Progress Bar */}
        <div className="w-full pt-2">
          <div className="w-full bg-[#EAE8E3] h-[3px] rounded-full overflow-hidden">
            <div className="bg-[#E5A93B] h-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <div className="flex justify-between items-center text-xs text-[#8A8A8E] mt-3 font-normal">
            <span>Step <strong className="text-[#1A1A1A] font-semibold">{step}</strong> Of 3</span>
            <span>
              {step === 1 ? 'Personal & Academic' : step === 2 ? 'Skills & Goals' : 'Review'}
            </span>
          </div>
        </div>

        <form action={handleFinalSubmit} className="mx-auto mt-10 max-w-2xl pb-16">
          {/* STEP 1: PERSONAL & ACADEMIC BACKGROUND */}
          {step === 1 && (
            <section className="space-y-8">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full border border-[#E7E2DA] bg-[#F3EFE6]/50 text-[11px] font-medium text-[#737373]">
                  • &nbsp; Personal & Academic
                </span>
                <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Tell us about yourself.</h1>
                <p className="text-xs text-[#737373]">Provide your details so we can customize your opportunities.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="First Name *">
                    <input
                      required
                      name="first_name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="e.g. Abraham"
                      className="w-full h-11 px-4 rounded-xl border border-[#E7E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#E5A93B] text-xs text-[#1A1A1A]"
                    />
                  </Field>

                  <Field label="Last Name *">
                    <input
                      required
                      name="last_name"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="e.g. Samuel"
                      className="w-full h-11 px-4 rounded-xl border border-[#E7E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#E5A93B] text-xs text-[#1A1A1A]"
                    />
                  </Field>
                </div>

                <Field label="Institution" hint="Optional">
                  <input name="institution" value={institution} onChange={e => setInstitution(e.target.value)} placeholder="University of Lagos" className="w-full h-11 px-4 rounded-xl border border-[#E7E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#E5A93B] text-xs text-[#1A1A1A]" />
                </Field>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Education Level *">
                    <select required name="education_level" value={educationLevel} onChange={e => setEducationLevel(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-[#E7E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#E5A93B] text-xs text-[#1A1A1A]">
                      <option value="">Select level *</option>
                      <option>High school</option>
                      <option>Undergraduate</option>
                      <option>Graduate</option>
                      <option>Recent graduate</option>
                    </select>
                  </Field>
                  <Field label="Field Of Study *">
                    <input required name="field_of_study" value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} placeholder="e.g. Computer Science" className="w-full h-11 px-4 rounded-xl border border-[#E7E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#E5A93B] text-xs text-[#1A1A1A]" />
                  </Field>
                </div>

                <Field label="Location *">
                  <input required name="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria" className="w-full h-11 px-4 rounded-xl border border-[#E7E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#E5A93B] text-xs text-[#1A1A1A]" />
                </Field>
              </div>
            </section>
          )}

          {/* STEP 2: SKILLS, BIO & GOALS */}
          {step === 2 && (
            <section className="space-y-8">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full border border-[#E7E2DA] bg-[#F3EFE6]/50 text-[11px] font-medium text-[#737373]">
                  • &nbsp; Skills & Goals
                </span>
                <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Showcase your expertise and goals.</h1>
              </div>

              <div className="space-y-3 pt-2">
                <Field label="Bio" hint="Write a short introduction">
                  <textarea name="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Share a little bit about yourself, your background, or your academic aspirations..." rows={3} className="w-full p-4 rounded-xl border border-[#E7E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#E5A93B] text-xs text-[#1A1A1A]" />
                </Field>
              </div>

              <div className="space-y-3 pt-2">
                <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">What can you already do? *</h2>
                <p className="text-xs text-[#737373]">Select at least one skill or add your custom skills.</p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {defaultSkills.map(skill => (
                    <button 
                      type="button" 
                      key={skill} 
                      onClick={() => toggle(skill, setSelectedSkills)} 
                      className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                        selectedSkills.includes(skill) 
                          ? 'bg-[#E5A93B] text-white border-[#E5A93B]' 
                          : 'bg-white border-[#E7E2DA] text-[#737373]'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3EFE6] px-3 py-1 text-xs font-medium text-[#1A1A1A] border border-[#E7E2DA]"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-[#737373] hover:text-red-600 transition">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input 
                    value={customSkill} 
                    onChange={e => setCustomSkill(e.target.value)} 
                    onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); addSkill() } }} 
                    placeholder="Add skill not listed" 
                    className="w-full h-11 px-4 rounded-xl border border-[#E7E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#E5A93B] text-xs text-[#1A1A1A]"
                  />
                  <button type="button" onClick={addSkill} className="px-6 h-11 rounded-xl bg-white border border-[#E7E2DA] text-xs font-semibold text-[#1A1A1A] flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">What are you looking for?</h2>
                <div className="flex flex-wrap gap-2">
                  {interests.map(item => (
                    <button 
                      type="button" 
                      key={item} 
                      onClick={() => toggle(item, setSelectedInterests)} 
                      className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                        selectedInterests.includes(item) 
                          ? 'bg-[#E5A93B] text-white border-[#E5A93B]' 
                          : 'bg-white border-[#E7E2DA] text-[#737373]'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <Field label="Career Goal" hint="A sentence is enough">
                    <textarea name="career_goal" value={careerGoal} onChange={e => setCareerGoal(e.target.value)} placeholder="Break into tech within the next year" rows={3} className="w-full p-4 rounded-xl border border-[#E7E2DA] bg-white focus:outline-none focus:ring-2 focus:ring-[#E5A93B] text-xs text-[#1A1A1A]" />
                  </Field>
                </div>
              </div>
            </section>
          )}

          {/* STEP 3: REVIEW & SUBMIT */}
          {step === 3 && (
            <section className="space-y-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full border border-[#E7E2DA] bg-[#F3EFE6]/50 text-[11px] font-medium text-[#737373] mb-3">
                  • &nbsp; Review
                </span>
                <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">Here&apos;s What We&apos;ll Use To Match You.</h1>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6 bg-white rounded-2xl border border-[#E7E2DA] text-xs">
                <div>
                  <span className="text-[#737373] font-medium">Full Name</span>
                  <p className="font-semibold text-[#1A1A1A] mt-0.5">{`${firstName} ${lastName}`.trim() || '—'}</p>
                </div>
                <div>
                  <span className="text-[#737373] font-medium">Institution</span>
                  <p className="font-semibold text-[#1A1A1A] mt-0.5">{institution || '—'}</p>
                </div>
                <div>
                  <span className="text-[#737373] font-medium">Education Level</span>
                  <p className="font-semibold text-[#1A1A1A] mt-0.5">{educationLevel || '—'}</p>
                </div>
                <div>
                  <span className="text-[#737373] font-medium">Field Of Study</span>
                  <p className="font-semibold text-[#1A1A1A] mt-0.5">{fieldOfStudy || '—'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[#737373] font-medium">Skills</span>
                  <p className="font-semibold text-[#1A1A1A] mt-0.5">{selectedSkills.length ? selectedSkills.join(', ') : '—'}</p>
                </div>
                <div>
                  <span className="text-[#737373] font-medium">Location</span>
                  <p className="font-semibold text-[#1A1A1A] mt-0.5">{location || '—'}</p>
                </div>
              </div>
            </section>
          )}

          {/* Hidden Inputs for Form Action */}
          <input type="hidden" name="first_name" value={firstName} />
          <input type="hidden" name="last_name" value={lastName} />
          <input type="hidden" name="institution" value={institution} />
          <input type="hidden" name="education_level" value={educationLevel} />
          <input type="hidden" name="field_of_study" value={fieldOfStudy} />
          <input type="hidden" name="location" value={location} />
          <input type="hidden" name="bio" value={bio} />
          <input type="hidden" name="career_goal" value={careerGoal} />
          <input type="hidden" name="skills" value={selectedSkills.join(',')} />
          <input type="hidden" name="interests" value={selectedInterests.join(',')} />

          {/* Navigation Controls */}
          <div className="mt-10 flex items-center justify-between">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(step - 1)} 
                className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1"
              >
                ← Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button 
                type="button" 
                onClick={() => setStep(step + 1)} 
                className="px-8 py-2.5 rounded-xl bg-[#E5A93B] hover:bg-[#D49830] text-white font-medium text-xs transition-all shadow-sm"
              >
                Continue
              </button>
            ) : (
              <button 
                type="submit" 
                className="px-8 py-2.5 rounded-xl bg-[#E5A93B] hover:bg-[#D49830] text-white font-medium text-xs transition-all shadow-sm"
              >
                Calculate My Matches
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) { 
  return (
    <label className="grid gap-1 text-xs font-semibold text-[#1A1A1A]">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {hint && <span className="text-[10px] text-[#737373] font-normal">{hint}</span>}
      </div>
      {children}
    </label>
  ) 
}