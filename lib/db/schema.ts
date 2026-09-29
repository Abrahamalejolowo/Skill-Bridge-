import { 
  boolean, 
  jsonb, 
  pgTable, 
  text, 
  timestamp, 
  unique,
  integer,
  varchar,
  decimal,
  date
} from 'drizzle-orm/pg-core'

// ============ EXISTING TABLES ============
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').default('student'), // Added: 'student' | 'creator' | 'admin'
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// ============ STUDENT PROFILE ============
export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  profilePictureUrl: text('profile_picture_url'),
  institution: text('institution'),
  educationLevel: text('education_level'),
  fieldOfStudy: text('field_of_study'),
  location: text('location'),
  bio: text('bio'),
  careerGoal: text('career_goal'),
  skills: text('skills').array(),
  interests: jsonb('interests').notNull().default([]),
  readinessScore: integer('readiness_score').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedOnboarding: boolean('completed_onboarding').default(false),
})

// ============ CREATOR/ORGANIZATION PROFILE (NEW) ============
export const creatorProfiles = pgTable('creator_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  organizationName: text('organization_name').notNull(),
  organizationType: text('organization_type').notNull(), // 'company' | 'university' | 'foundation' | 'nonprofit' | 'individual'
  description: text('description'),
  website: text('website'),
  industry: text('industry'),
  location: text('location'),
  logoUrl: text('logo_url'),
  contactPersonName: text('contact_person_name'),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  
  // Verification
  verificationStatus: text('verification_status').default('pending'), // 'pending' | 'verified' | 'rejected'
  rejectionReason: text('rejection_reason'),
  verificationNotes: text('verification_notes'),
  verifiedAt: timestamp('verified_at'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============ OPPORTUNITIES (EXTENDED) ============
export const opportunities = pgTable('opportunities', {
  id: text('id').primaryKey(),
  creatorId: text('creator_id').notNull(), // Link to creator
  
  // Basic Info
  type: text('type').notNull(), // 'Internship' | 'Scholarship' | 'Hackathon' | 'Grant' | 'Fellowship'
  title: text('title').notNull(),
  shortDescription: text('short_description'),
  description: text('description').notNull(),
  
  // Requirements & Skills
  requirements: jsonb('requirements').notNull().default([]), // Array of requirement strings
  skillsNeeded: jsonb('skills_needed').notNull().default([]), // Array of skill strings
  
  // Timeline & Location
  startDate: timestamp('start_date'),
  deadline: timestamp('deadline').notNull(),
  durationMonths: integer('duration_months'),
  location: text('location'),
  remote: text('remote').default('remote'), // 'remote' | 'onsite' | 'hybrid'
  
  // Compensation
  compensation: text('compensation'), // 'Paid' | 'Unpaid' | 'Scholarship' etc
  compensationAmount: decimal('compensation_amount', { precision: 10, scale: 2 }),
  
  // Status
  status: text('status').default('draft'), // 'draft' | 'pending_review' | 'active' | 'closed' | 'rejected'
  rejectionReason: text('rejection_reason'),
  
  // Analytics
  viewCount: integer('view_count').default(0),
  applicationCount: integer('application_count').default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============ APPLICATIONS (EXTENDED) ============
export const applications = pgTable(
  'applications',
  {
    id: text('id').primaryKey(),
    studentId: text('student_id').notNull(), // Reference to student profile
    opportunityId: text('opportunity_id').notNull(), // Reference to opportunity
    
    // Application Details
    status: text('status').notNull().default('applied'), // 'applied' | 'reviewing' | 'accepted' | 'rejected'
    responseLetter: text('response_letter'),
    
    // AI Matching
    aiMatchScore: integer('ai_match_score'),
    aiMatchSummary: text('ai_match_summary'),
    
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.studentId, table.opportunityId)]
)

// ============ SAVED OPPORTUNITIES ============
export const savedOpportunities = pgTable(
  'saved_opportunities',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    opportunityId: text('opportunity_id').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.userId, table.opportunityId)]
)

// ============ AI GENERATION LOGS (NEW) ============
export const aiGenerationLogs = pgTable('ai_generation_logs', {
  id: text('id').primaryKey(),
  creatorId: text('creator_id').notNull(),
  opportunityId: text('opportunity_id'),
  
  prompt: text('prompt').notNull(),
  generatedData: jsonb('generated_data'),
  
  tokensUsed: integer('tokens_used'),
  status: text('status').default('success'), // 'success' | 'failed'
  error: text('error'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============ NOTIFICATIONS (NEW) ============
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  recipientId: text('recipient_id').notNull(), // User who receives notification
  type: text('type').notNull(), // 'application_received' | 'application_accepted' | 'opportunity_active' etc
  title: text('title').notNull(),
  message: text('message').notNull(),
  relatedId: text('related_id'), // opportunity_id or application_id
  read: boolean('read').default(false),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============ EXPORT ALL ============
export const tables = {
  user,
  session,
  account,
  verification,
  profiles,
  creatorProfiles,
  opportunities,
  applications,
  savedOpportunities,
  aiGenerationLogs,
  notifications,
}