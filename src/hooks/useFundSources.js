import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchRecords, saveRecord, updateRecord, deleteRecord } from '../lib/offlineSync'

export function useFundSources() {
  const { user } = useAuth()
  const [fundSources, setFundSources] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchRecords('fund_sources', user.id)
      setFundSources(data)
    } catch (err) {
      console.error('Failed to load fund sources:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const addFundSource = async (data) => {
    if (!user) return
    const record = await saveRecord('fund_sources', data, user.id)
    setFundSources(prev => [record, ...prev])
    return record
  }

  const removeFundSource = async (id) => {
    if (!user) return
    await deleteRecord('fund_sources', id, user.id)
    setFundSources(prev => prev.filter(f => f.id !== id))
  }

  const editFundSource = async (id, updates) => {
    if (!user) return
    await updateRecord('fund_sources', id, updates, user.id)
    setFundSources(prev =>
      prev.map(f => f.id === id ? { ...f, ...updates } : f)
    )
  }

  return {
    fundSources,
    loading,
    addFundSource,
    removeFundSource,
    editFundSource,
    refresh: load
  }
}
