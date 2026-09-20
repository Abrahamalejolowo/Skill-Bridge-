import { boolean, jsonb, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
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

export const opportunities = pgTable('opportunities', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  organization: text('organization').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  deadline: timestamp('deadline').notNull(),
  applicationUrl: text('applicationUrl').notNull(),
  location: text('location').notNull(),
  skills: jsonb('skills').notNull().default([]),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  institution: text('institution'),
  educationLevel: text('education_level'),
  fieldOfStudy: text('field_of_study'),
  location: text('location'),
  bio: text('bio'),
  careerGoal: text('career_goal'),
  skills: text('skills').array(),
  interests: jsonb('interests').notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedOnboarding: boolean('completed_onboarding').default(false),

})

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

export const applications = pgTable(
  'applications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    opportunityId: text('opportunity_id').notNull(),
    status: text('status').notNull().default('saved'),
    notes: text('notes'),
    appliedAt: timestamp('applied_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [unique().on(table.userId, table.opportunityId)]
)

