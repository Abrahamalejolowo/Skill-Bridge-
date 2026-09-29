'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Building2, Save, CheckCircle2, AlertCircle, Globe, MapPin, 
  Briefcase, User, Mail, Phone, Edit3, X 
} from 'lucide-react'

export default function CreatorProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    organization_name: '',
    organization_type: '',
    description: '',
    website: '',
    industry: '',
    location: '',
    contact_person_name: '',
    contact_email: '',
    contact_phone: '',
  })

  // Keep a backup state to revert if user cancels editing
  const [initialData, setInitialData] = useState(formData)

  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        const fetched = {
          organization_name: data.organization_name || '',
          organization_type: data.organization_type || '',
          description: data.description || '',
          website: data.website || '',
          industry: data.industry || '',
          location: data.location || '',
          contact_person_name: data.contact_person_name || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
        }
        setFormData(fetched)
        setInitialData(fetched)
      }
      if (error) throw error
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCancel = () => {
    setFormData(initialData)
    setIsEditing(false)
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('creator_profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      setInitialData(formData)
      setIsEditing(false)
      setMessage({ type: 'success', text: 'Organization profile updated successfully!' })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Organization Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage your organization details and public information</p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-95 transition-all shadow-lg shadow-primary/20 text-sm shrink-0"
          >
            <Edit3 className="size-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Message Notification Banner */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border text-sm transition-all ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-black/5 space-y-8">
        
        {/* Section 1: Organization Details */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Organization Details</h2>
                <p className="text-xs text-muted-foreground">Core information about your business or institution</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Organization Name *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-foreground py-2 px-1 bg-muted/20 rounded-xl border border-transparent">
                  {formData.organization_name || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Organization Type
              </label>
              {isEditing ? (
                <select
                  name="organization_type"
                  value={formData.organization_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                >
                  <option value="">Select type...</option>
                  <option value="company">Company</option>
                  <option value="university">University / Institution</option>
                  <option value="ngo">NGO / Non-Profit</option>
                  <option value="startup">Startup</option>
                </select>
              ) : (
                <p className="text-sm font-medium text-foreground capitalize py-2 px-1 bg-muted/20 rounded-xl border border-transparent">
                  {formData.organization_type || 'Not provided'}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell students and graduates about your organization..."
                className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm resize-y"
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed py-2 px-1 bg-muted/20 rounded-xl border border-transparent whitespace-pre-wrap">
                {formData.description || 'No description provided.'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Globe className="size-3.5" /> Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                />
              ) : (
                <div className="py-2 px-1 text-sm font-medium">
                  {formData.website ? (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">
                      {formData.website}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Briefcase className="size-3.5" /> Industry
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. Software & IT"
                  className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-foreground py-2 px-1">
                  {formData.industry || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <MapPin className="size-3.5" /> Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Lagos, Nigeria"
                  className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-foreground py-2 px-1">
                  {formData.location || 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Contact Person Details */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/60">
            <div className="flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary">
              <User className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Contact Person Details</h2>
              <p className="text-xs text-muted-foreground">Primary administrative point of contact</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Contact Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="contact_person_name"
                  value={formData.contact_person_name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-foreground py-2 px-1">
                  {formData.contact_person_name || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Mail className="size-3.5" /> Contact Email *
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  required
                  placeholder="name@organization.com"
                  className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-foreground py-2 px-1">
                  {formData.contact_email || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Phone className="size-3.5" /> Contact Phone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="+234..."
                  className="w-full px-4 py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-foreground py-2 px-1">
                  {formData.contact_phone || 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons (Only shown when editing) */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/60">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-5 py-3 rounded-2xl border border-border text-foreground font-semibold hover:bg-muted transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 text-sm"
            >
              <Save className="size-4" />
              {saving ? 'Saving changes...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}