'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateRoadmapAction(formData: FormData) {
  console.log('updateRoadmapAction called')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('No user found')
    return
  }

  const id = formData.get('id') as string
  const actionType = formData.get('actionType') as string

  console.log('ID:', id, 'Action:', actionType)

  if (!id) {
    console.error('No ID provided')
    return
  }

  try {
    if (actionType === 'complete') {
      console.log('Marking as complete')
      const { error } = await supabase
        .from('roadmap_items')
        .update({ status: 'completed', progress: 100 })
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Update error:', error)
        throw error
      }
    } else if (actionType === 'start') {
      console.log('Starting item')
      const { error } = await supabase
        .from('roadmap_items')
        .update({ status: 'in_progress', progress: 15 })
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Update error:', error)
        throw error
      }
    }

    console.log('Update successful, revalidating')
    revalidatePath('/roadmap')
  } catch (error) {
    console.error('Server action error:', error)
    throw error
  }
}