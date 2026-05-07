import { useState, useEffect } from 'react'
import { Network } from '@capacitor/network'
import { syncPendingData } from '../lib/offlineSync'
import { useAuth } from '../contexts/AuthContext'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { user } = useAuth()

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true)
      // Auto-sync pending data when coming back online
      if (user) {
        try {
          const count = await syncPendingData(user.id)
          if (count > 0) {
            console.log(`Synced ${count} pending records`)
          }
        } catch (err) {
          console.error('Auto-sync failed:', err)
        }
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    // Capacitor Network listener
    const setupCapacitorNetworkListener = async () => {
      try {
        const unsubscribe = await Network.addListener('networkStatusChange', (status) => {
          if (status.connected) {
            handleOnline()
          } else {
            handleOffline()
          }
        })

        // Check initial status
        const status = await Network.getStatus()
        setIsOnline(status.connected)

        return unsubscribe
      } catch (err) {
        console.log('Capacitor Network not available, using web API')
        return null
      }
    }

    let unsubscribe = null

    // Setup Capacitor listener if available
    setupCapacitorNetworkListener().then((unsub) => {
      unsubscribe = unsub
    })

    // Fallback to web API
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      if (unsubscribe) {
        unsubscribe.remove()
      }
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user])

  return isOnline
}
