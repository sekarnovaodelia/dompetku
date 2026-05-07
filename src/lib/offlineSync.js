import { Preferences } from '@capacitor/preferences'
import { supabase } from './supabase'

// ============================
// Storage Helpers using Capacitor Preferences
// ============================
async function getLocal(table) {
  try {
    const { value } = await Preferences.get({ key: table })
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

async function setLocal(table, data) {
  await Preferences.set({
    key: table,
    value: JSON.stringify(data)
  })
}

// ============================
// Save Record (Online-first)
// ============================
export async function saveRecord(table, data, userId) {
  const record = {
    ...data,
    id: data.id || crypto.randomUUID(),
    user_id: userId,
    synced: navigator.onLine,
    created_at: new Date().toISOString()
  }

  // Always save locally first
  const local = await getLocal(table)
  local.push(record)
  await setLocal(table, local)

  // Try to upload if online
  if (navigator.onLine) {
    try {
      const { synced, ...dbRecord } = record
      const { error } = await supabase.from(table).insert(dbRecord)
      if (error) {
        await markUnsynced(table, record.id)
        console.error('Upload failed:', error)
      }
    } catch (err) {
      await markUnsynced(table, record.id)
      console.error('Upload failed:', err)
    }
  }

  return record
}

// ============================
// Update Record
// ============================
export async function updateRecord(table, id, updates, userId) {
  // Update locally
  const local = await getLocal(table)
  const index = local.findIndex(r => r.id === id)
  if (index !== -1) {
    local[index] = { ...local[index], ...updates, synced: navigator.onLine }
    await setLocal(table, local)
  }

  // Try to upload if online
  if (navigator.onLine) {
    try {
      const { synced, ...dbUpdates } = updates
      const { error } = await supabase
        .from(table)
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', userId)
      if (error) {
        await markUnsynced(table, id)
      }
    } catch (err) {
      await markUnsynced(table, id)
    }
  } else {
    await markUnsynced(table, id)
  }
}

// ============================
// Delete Record
// ============================
export async function deleteRecord(table, id, userId) {
  // Delete locally
  const local = await getLocal(table)
  const filtered = local.filter(r => r.id !== id)
  await setLocal(table, filtered)

  // Try to delete from server if online
  if (navigator.onLine) {
    try {
      await supabase.from(table).delete().eq('id', id).eq('user_id', userId)
    } catch (err) {
      console.error('Delete sync failed:', err)
    }
  }
}

// ============================
// Fetch Data (Online-first, fallback local)
// ============================
export async function fetchRecords(table, userId) {
  if (navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        // Update local cache with server data
        const localData = data.map(d => ({ ...d, synced: true }))
        await setLocal(table, localData)
        return localData
      }
    } catch (err) {
      console.error('Fetch failed, using local:', err)
    }
  }

  // Fallback to local data
  const local = await getLocal(table)
  return local.filter(r => r.user_id === userId)
}

// ============================
// Mark record as unsynced
// ============================
async function markUnsynced(table, id) {
  const local = await getLocal(table)
  const index = local.findIndex(r => r.id === id)
  if (index !== -1) {
    local[index].synced = false
    await setLocal(table, local)
  }
}

// ============================
// Sync All Pending Data
// ============================
export async function syncPendingData(userId) {
  const tables = ['transactions', 'debts', 'fund_sources']
  let syncedCount = 0

  for (const table of tables) {
    const local = await getLocal(table)
    const pending = local.filter(t => !t.synced && t.user_id === userId)

    for (const record of pending) {
      try {
        const { synced, ...dbRecord } = record
        const { error } = await supabase.from(table).upsert(dbRecord)
        if (!error) {
          record.synced = true
          syncedCount++
        }
      } catch (err) {
        console.error(`Sync failed for ${table}:`, err)
      }
    }

    await setLocal(table, local)
  }

  return syncedCount
}

// ============================
// Get Local Data (no server call)
// ============================
export async function getLocalRecords(table) {
  return getLocal(table)
}
