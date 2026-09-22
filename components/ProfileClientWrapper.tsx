'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MobileHeader from '@/components/MobileHeader'
import { updateProfile } from '@/app/actions/profile'
import {
  LayoutDashboard,
  Compass,
  Bookmark,
  Map,
  User,
  LogOut,
  Pencil,
  X,
  Loader2,
  LucideIcon,
  MessageCircle,
} from 'lucide-react'

interface ProfilePageProps {
  initialProfile: any
  userEmail: string
  applications?: any[]
}

export default function ProfileClientWrapper({ initialProfile, userEmail, applications = [] }: ProfilePageProps) {
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [isEditingSkills, setIsEditingSkills] = useState(false)
  const [isEditingInterests, setIsEditingInterests] = useState(false)

  // Profile fields state
  const [firstName, setFirstName] = useState(initialProfile?.first_name || '')
  const [lastName, setLastName] = useState(initialProfile?.last_name || '')
  const [institution, setInstitution] = useState(initialProfile?.institution || '')
  const [educationLevel, setEducationLevel] = useState(initialProfile?.education_level || '')
  const [fieldOfStudy, setFieldOfStudy] = useState(initialProfile?.field_of_study || '')
  const [location, setLocation] = useState(initialProfile?.location || '')
  const [careerGoal, setCareerGoal] = useState(initialProfile?.career_goal || '')
  const [bio, setBio] = useState(initialProfile?.bio || '')
  const [skills, setSkills] = useState<string[]>(initialProfile?.skills || [])
  const [interests, setInterests] = useState<string[]>(initialProfile?.interests || [])

  // Skills input state
  const [skillInput, setSkillInput] = useState('')
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([])

  // Interests input state
  const [interestInput, setInterestInput] = useState('')

  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

  // Sync state if server re-renders initialProfile
  useEffect(() => {
    if (initialProfile) {
      setFirstName(initialProfile.first_name || '')
      setLastName(initialProfile.last_name || '')
      setInstitution(initialProfile.institution || '')
      setEducationLevel(initialProfile.education_level || '')
      setFieldOfStudy(initialProfile.field_of_study || '')
      setLocation(initialProfile.location || '')
      setCareerGoal(initialProfile.career_goal || '')
      setBio(initialProfile.bio || '')
      setSkills(initialProfile.skills || [])
      setInterests(initialProfile.interests || [])
    }
  }, [initialProfile])

  // Fetch skill suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!skillInput.trim()) {
        setSkillSuggestions([])
        return
      }
      try {
        const res = await fetch(`/api/skills?q=${encodeURIComponent(skillInput)}`)
        const data = await res.json()
        setSkillSuggestions(data.filter((s: string) => !skills.includes(s)))
      } catch (err) {
        console.error('Failed to fetch skill suggestions', err)
      }
    }

    const timer = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(timer)
  }, [skillInput, skills])

  const handleSave = (updatedFields: Record<string, any>) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('first_name', updatedFields.firstName ?? firstName)
      formData.append('last_name', updatedFields.lastName ?? lastName)
      formData.append('institution', updatedFields.institution ?? institution)
      formData.append('education_level', updatedFields.educationLevel ?? educationLevel)
      formData.append('field_of_study', updatedFields.fieldOfStudy ?? fieldOfStudy)
      formData.append('location', updatedFields.location ?? location)
      formData.append('career_goal', updatedFields.careerGoal ?? careerGoal)
      formData.append('bio', updatedFields.bio ?? bio)
      formData.append('skills', JSON.stringify(updatedFields.skills ?? skills))
      formData.append('interests', JSON.stringify(updatedFields.interests ?? interests))

      try {
        const result = await updateProfile(formData)

        if (result?.profile) {
          setFirstName(result.profile.first_name || '')
          setLastName(result.profile.last_name || '')
          setInstitution(result.profile.institution || '')
          setEducationLevel(result.profile.education_level || '')
          setFieldOfStudy(result.profile.field_of_study || '')
          setLocation(result.profile.location || '')
          setCareerGoal(result.profile.career_goal || '')
          setBio(result.profile.bio || '')
          setSkills(result.profile.skills || [])
          setInterests(result.profile.interests || [])
        }

        setIsEditingSkills(false)
        setIsEditingInterests(false)
        setIsEditingInfo(false)
        setIsEditingBio(false)
        router.refresh()
      } catch (err) {
        console.error('Failed to update profile', err)
      }
    })
  }

  return (
    <div className="flex min-h-screen bg-[#F7F7F2] text-[#1A1A1A] font-sans antialiased overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="fixed bottom-0 top-0 left-0 hidden lg:flex w-64 flex-col justify-between border-r border-[#EAEAE2] bg-white px-6 py-8 z-30">
        <div>
          <Link href="/" className="font-serif text-2xl font-bold text-[#4B7355]">
            Skills<span className="text-[#E29D38]">bridge</span>
          </Link>

          <nav className="mt-12 space-y-2">
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink href="/explore" icon={Compass} label="Explore" />
            <SidebarLink href="/saved" icon={Bookmark} label="Saved" />
            <SidebarLink href="/roadmap" icon={Map} label="Roadmap" />
            <SidebarLink href="/chat" icon={MessageCircle} label="AI Advisor" />
            <SidebarLink href="/profile" icon={User} label="Profile" active />
          </nav>
        </div>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#666] transition hover:bg-[#F5F5EF] hover:text-[#1A1A1A]"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </form>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 w-full lg:pl-64 flex flex-col min-h-screen ">
        {/* Fixed Mobile Header */}
        <div className=" lg:hidden fixed top-0 left-0 right-0 z-40 ">
          <MobileHeader initials={initials} />
        </div>

        {/* Main Content (added pt-16 or pt-20 on mobile to clear the fixed header) */}
        <main className="mx-auto w-full max-w-5xl px-4 sm:px-8 lg:px-10 pt-20 lg:pt-10 pb-12 flex-1">
          <section>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold">My Profile</h1>
            <p className="mt-1 text-xs sm:text-sm text-[#777]">
              Keep Your Information Up To Date So SkillsBridge Can Find Opportunities That Fit You Better.
            </p>
          </section>

          <div className="mt-6 sm:mt-8 space-y-6">
            {/* Header Avatar Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#EBEBE3] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-full bg-[#4B7355] text-2xl sm:text-3xl font-bold text-white">
                  {initials || '?'}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">
                    {firstName || lastName ? `${firstName} ${lastName}` : 'Complete Your Profile'}
                  </h2>
                  <p className="mt-1 text-xs font-medium text-[#777]">{educationLevel || 'No education level set'}</p>
                  <p className="mt-0.5 text-xs text-[#888]">{fieldOfStudy ? `${fieldOfStudy} Student` : 'Field of study not set'}</p>
                </div>
              </div>
            </div>

            {/* Opportunities Section */}
            {applications.length > 0 && (
              <div className="rounded-2xl border border-[#EBEBE3] bg-white overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-[#EBEBE3]">
                  <h3 className="font-serif text-lg font-semibold">Saved & Tracked Opportunities</h3>
                </div>
                <div className="divide-y divide-[#EBEBE3]">
                  {applications.map((item) => {
                    const opp = item.opportunity
                    const oppId = item.opportunity_id || opp?.id

                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center p-4 sm:p-6 bg-white transition hover:bg-[#FAFAFA]"
                      >
                        <div>
                          <h2 className="font-serif text-sm sm:text-base font-bold text-[#1A1A1A]">
                            {oppId ? (
                              <Link href={`/explore/${oppId}`} className="hover:text-[#4B7355] transition">
                                {opp?.title || 'Untitled Opportunity'}
                              </Link>
                            ) : (
                              <span>{opp?.title || 'Untitled Opportunity'}</span>
                            )}
                          </h2>
                          <p className="text-xs text-[#666] mt-0.5">{opp?.organization || 'Unknown Organization'}</p>
                        </div>
                        <div>
                          <span className="inline-block rounded-full bg-[#EAF2EC] px-3 py-1 text-xs font-semibold text-[#4B7355]">
                            {opp?.category || 'General'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-[#C88A2B]">
                            {opp?.match_score ? `${opp.match_score}%` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-[#666]">{opp?.deadline ? opp.deadline : 'No deadline'}</span>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                          {oppId ? (
                            <Link
                              href={`/explore/${oppId}`}
                              className="rounded-xl bg-[#4B7355] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3D5E45]"
                            >
                              View
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-400 cursor-not-allowed">View</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="rounded-2xl border border-[#EBEBE3] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F5F5EF] pb-4">
                <h3 className="font-serif text-lg font-semibold">Personal Information</h3>
                <button
                  onClick={() => setIsEditingInfo(!isEditingInfo)}
                  className="flex items-center gap-2 rounded-full border border-[#D5D5CD] px-4 sm:px-5 py-2 text-xs font-semibold text-[#1A1A1A] transition hover:bg-[#F5F5EF]"
                >
                  {isEditingInfo ? 'Cancel' : 'Edit'} <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              {!isEditingInfo ? (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <p className="text-xs text-[#999]">First Name</p>
                    <p className="mt-1.5 text-sm font-medium text-[#1A1A1A]">{firstName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#999]">Last Name</p>
                    <p className="mt-1.5 text-sm font-medium text-[#1A1A1A]">{lastName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#999]">Email Address</p>
                    <p className="mt-1.5 text-sm font-medium text-[#1A1A1A]">{userEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#999]">Institution</p>
                    <p className="mt-1.5 text-sm font-medium text-[#1A1A1A]">{institution || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#999]">Education Level</p>
                    <p className="mt-1.5 text-sm font-medium text-[#1A1A1A]">{educationLevel || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#999]">Field of Study</p>
                    <p className="mt-1.5 text-sm font-medium text-[#1A1A1A]">{fieldOfStudy || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#999]">Location</p>
                    <p className="mt-1.5 text-sm font-medium text-[#1A1A1A]">{location || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#999]">Career Goal</p>
                    <p className="mt-1.5 text-sm font-medium text-[#1A1A1A]">{careerGoal || '-'}</p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSave({ firstName, lastName, institution, educationLevel, fieldOfStudy, location, careerGoal })
                  }}
                  className="mt-6 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#999] mb-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-xl border border-[#D5D5CD] bg-[#F9F9F4] p-3 text-sm outline-none focus:border-[#4B7355]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#999] mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-xl border border-[#D5D5CD] bg-[#F9F9F4] p-3 text-sm outline-none focus:border-[#4B7355]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#999] mb-1">Institution</label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full rounded-xl border border-[#D5D5CD] bg-[#F9F9F4] p-3 text-sm outline-none focus:border-[#4B7355]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#999] mb-1">Education Level</label>
                      <input
                        type="text"
                        value={educationLevel}
                        onChange={(e) => setEducationLevel(e.target.value)}
                        className="w-full rounded-xl border border-[#D5D5CD] bg-[#F9F9F4] p-3 text-sm outline-none focus:border-[#4B7355]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#999] mb-1">Field of Study</label>
                      <input
                        type="text"
                        value={fieldOfStudy}
                        onChange={(e) => setFieldOfStudy(e.target.value)}
                        className="w-full rounded-xl border border-[#D5D5CD] bg-[#F9F9F4] p-3 text-sm outline-none focus:border-[#4B7355]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#999] mb-1">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-xl border border-[#D5D5CD] bg-[#F9F9F4] p-3 text-sm outline-none focus:border-[#4B7355]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-[#999] mb-1">Career Goal</label>
                      <input
                        type="text"
                        value={careerGoal}
                        onChange={(e) => setCareerGoal(e.target.value)}
                        className="w-full rounded-xl border border-[#D5D5CD] bg-[#F9F9F4] p-3 text-sm outline-none focus:border-[#4B7355]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="rounded-xl border border-[#D5D5CD] px-4 py-2 text-xs font-semibold text-[#666]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex items-center gap-2 rounded-xl bg-[#4B7355] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#3D5E45]"
                    >
                      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* About Me Section */}
            <div className="rounded-2xl border border-[#EBEBE3] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F5F5EF] pb-4">
                <h3 className="font-serif text-lg font-semibold">About Me</h3>
                <button
                  onClick={() => setIsEditingBio(!isEditingBio)}
                  className="flex items-center gap-2 rounded-full border border-[#D5D5CD] px-4 sm:px-5 py-2 text-xs font-semibold text-[#1A1A1A] transition hover:bg-[#F5F5EF]"
                >
                  {isEditingBio ? 'Cancel' : 'Edit'} <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              {!isEditingBio ? (
                <p className="mt-4 text-sm text-[#555] leading-relaxed">
                  {bio || 'No bio provided yet. Click edit to add a short professional bio about yourself.'}
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a brief professional summary..."
                    className="w-full rounded-xl border border-[#D5D5CD] bg-[#F9F9F4] p-3 text-sm outline-none focus:border-[#4B7355]"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingBio(false)}
                      className="rounded-xl border border-[#D5D5CD] px-4 py-2 text-xs font-semibold text-[#666]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave({ bio })}
                      disabled={isPending}
                      className="flex items-center gap-2 rounded-xl bg-[#4B7355] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#3D5E45]"
                    >
                      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save Bio
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Skills Section */}
            <div className="rounded-2xl border border-[#EBEBE3] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F5F5EF] pb-4">
                <h3 className="font-serif text-lg font-semibold">Skills</h3>
                <button
                  onClick={() => setIsEditingSkills(!isEditingSkills)}
                  className="flex items-center gap-2 rounded-full border border-[#D5D5CD] px-4 sm:px-5 py-2 text-xs font-semibold text-[#1A1A1A] transition hover:bg-[#F5F5EF]"
                >
                  {isEditingSkills ? 'Done' : 'Edit Skills'} <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {skills.length > 0 ? (
                  skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#EBEBE3] bg-[#FAFDF9] px-4 py-1.5 text-xs font-medium text-[#1A1A1A]"
                    >
                      {skill}
                      {isEditingSkills && (
                        <button
                          onClick={() => setSkills(skills.filter((s: string) => s !== skill))}
                          className="text-[#999] hover:text-[#D9534F]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[#888]">No skills added yet.</p>
                )}
              </div>

              {isEditingSkills && (
                <div className="mt-6 relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Type a skill to search or add..."
                      className="flex-1 rounded-xl border border-[#D5D5CD] bg-[#F9F9F4] p-3 text-sm outline-none focus:border-[#4B7355]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && skillInput.trim()) {
                          e.preventDefault()
                          if (!skills.includes(skillInput.trim())) {
                            setSkills([...skills, skillInput.trim()])
                          }
                          setSkillInput('')
                          setSkillSuggestions([])
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                          setSkills([...skills, skillInput.trim()])
                          setSkillInput('')
                          setSkillSuggestions([])
                        }
                      }}
                      className="rounded-xl bg-[#4B7355] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#3D5E45]"
                    >
                      Add
                    </button>
                  </div>

                  {skillSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-xl border border-[#EAEAE2] bg-white shadow-lg overflow-hidden">
                      {skillSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setSkills([...skills, suggestion])
                            setSkillInput('')
                            setSkillSuggestions([])
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#333] hover:bg-[#F5F5EF] transition"
                        >
                          + Add {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleSave({ skills })}
                      disabled={isPending}
                      className="flex items-center gap-2 rounded-xl bg-[#4B7355] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3D5E45]"
                    >
                      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save Skills
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Interests Section */}
            <div className="rounded-2xl border border-[#EBEBE3] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F5F5EF] pb-4">
                <h3 className="font-serif text-lg font-semibold">Interests</h3>
                <button
                  onClick={() => setIsEditingInterests(!isEditingInterests)}
                  className="flex items-center gap-2 rounded-full border border-[#D5D5CD] px-4 sm:px-5 py-2 text-xs font-semibold text-[#1A1A1A] transition hover:bg-[#F5F5EF]"
                >
                  {isEditingInterests ? 'Done' : 'Edit Interests'} <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {interests.length > 0 ? (
                  interests.map((interest: string) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#EBEBE3] bg-[#FAFDF9] px-4 py-1.5 text-xs font-medium text-[#1A1A1A]"
                    >
                      {interest}
                      {isEditingInterests && (
                        <button
                          onClick={() => setInterests(interests.filter((i) => i !== interest))}
                          className="text-[#999] hover:text-[#D9534F]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[#888]">No interests added yet.</p>
                )}
              </div>

              {isEditingInterests && (
                <div className="mt-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      placeholder="Type an interest..."
                      className="flex-1 rounded-xl border border-[#D5D5CD] bg-[#F9F9F4] p-3 text-sm outline-none focus:border-[#4B7355]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && interestInput.trim()) {
                          e.preventDefault()
                          if (!interests.includes(interestInput.trim())) {
                            setInterests([...interests, interestInput.trim()])
                          }
                          setInterestInput('')
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (interestInput.trim() && !interests.includes(interestInput.trim())) {
                          setInterests([...interests, interestInput.trim()])
                          setInterestInput('')
                        }
                      }}
                      className="rounded-xl bg-[#4B7355] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#3D5E45]"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleSave({ interests })}
                      disabled={isPending}
                      className="flex items-center gap-2 rounded-xl bg-[#4B7355] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3D5E45]"
                    >
                      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save Interests
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: LucideIcon
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? 'bg-[#F4F7F4] text-[#4B7355]'
          : 'text-[#666] hover:bg-[#F5F5EF] hover:text-[#1A1A1A]'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  )
}