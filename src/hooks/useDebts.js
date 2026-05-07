import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchRecords, saveRecord, updateRecord, deleteRecord } from '../lib/offlineSync'

export function useDebts() {
  const { user } = useAuth()
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchRecords('debts', user.id)
      setDebts(data)
    } catch (err) {
      console.error('Failed to load debts:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const addDebt = async (data) => {
    if (!user) return
    const record = await saveRecord('debts', data, user.id)
    setDebts(prev => [record, ...prev])
    return record
  }

  const removeDebt = async (id) => {
    if (!user) return
    await deleteRecord('debts', id, user.id)
    setDebts(prev => prev.filter(d => d.id !== id))
  }

  const markAsPaid = async (id) => {
    if (!user) return
    const updates = { is_paid: true, paid_at: new Date().toISOString() }
    await updateRecord('debts', id, updates, user.id)
    setDebts(prev =>
      prev.map(d => d.id === id ? { ...d, ...updates } : d)
    )
  }

  const editDebt = async (id, updates) => {
    if (!user) return
    await updateRecord('debts', id, updates, user.id)
    setDebts(prev =>
      prev.map(d => d.id === id ? { ...d, ...updates } : d)
    )
  }

  return {
    debts,
    loading,
    addDebt,
    removeDebt,
    markAsPaid,
    editDebt,
    refresh: load
  }
}
