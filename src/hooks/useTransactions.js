import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchRecords, saveRecord, updateRecord, deleteRecord } from '../lib/offlineSync'

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchRecords('transactions', user.id)
      setTransactions(data)
    } catch (err) {
      console.error('Failed to load transactions:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const addTransaction = async (data) => {
    if (!user) return
    const record = await saveRecord('transactions', data, user.id)
    setTransactions(prev => [record, ...prev])
    return record
  }

  const removeTransaction = async (id) => {
    if (!user) return
    await deleteRecord('transactions', id, user.id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const editTransaction = async (id, updates) => {
    if (!user) return
    await updateRecord('transactions', id, updates, user.id)
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    )
  }

  return {
    transactions,
    loading,
    addTransaction,
    removeTransaction,
    editTransaction,
    refresh: load
  }
}
