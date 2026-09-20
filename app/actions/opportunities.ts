'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { applications, savedOpportunities } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function userId() { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) throw new Error('Unauthorized'); return session.user.id }
export async function saveOpportunity(opportunityId: string) { const id = await userId(); const exists = await db.select({ id: savedOpportunities.id }).from(savedOpportunities).where(and(eq(savedOpportunities.userId, id), eq(savedOpportunities.opportunityId, opportunityId))).limit(1); if (!exists[0]) await db.insert(savedOpportunities).values({ id: crypto.randomUUID(), userId: id, opportunityId }); revalidatePath('/dashboard'); revalidatePath(`/opportunities/${opportunityId}`) }
export async function trackApplication(opportunityId: string, status = 'applied') { const id = await userId(); const exists = await db.select({ id: applications.id }).from(applications).where(and(eq(applications.userId, id), eq(applications.opportunityId, opportunityId))).limit(1); if (exists[0]) await db.update(applications).set({ status, appliedAt: new Date(), updatedAt: new Date() }).where(eq(applications.id, exists[0].id)); else await db.insert(applications).values({ id: crypto.randomUUID(), userId: id, opportunityId, status, appliedAt: new Date() }); revalidatePath('/applications'); revalidatePath(`/opportunities/${opportunityId}`) }
