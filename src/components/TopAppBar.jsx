import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export default function TopAppBar() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const isOnline = useOnlineStatus()

  const handleLogout = async () => {
    const confirmed = window.confirm('Yakin ingin logout?')
    if (!confirmed) return

    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <header className="bg-emerald-50 fixed top-0 left-0 w-full z-50 border-b-2 border-emerald-200">
      <div className="flex justify-between items-center w-full px-6 py-4 h-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-rounded text-emerald-800 text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            account_balance_wallet
          </span>
          <h1 className="text-2xl font-black text-emerald-900 tracking-tight">
            DompetKu
          </h1>
        </div>

        {/* Online/Offline Badge + Logout */}
        <div className="flex items-center gap-md">
          {/* Online/Offline Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              isOnline
                ? 'bg-emerald-100 border-color-success/30'
                : 'bg-red-100 border-color-offline/30'
            }`}
          >
            {isOnline ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-color-success animate-pulse-glow" />
                <span
                  className="material-symbols-rounded text-emerald-700 text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  cloud_done
                </span>
                <span className="text-badge font-semibold text-emerald-800">
                  Online
                </span>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-color-offline animate-pulse" />
                <span
                  className="material-symbols-rounded text-red-600 text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  cloud_off
                </span>
                <span className="text-badge font-semibold text-red-700">
                  Offline
                </span>
              </>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-100 rounded-full transition-colors text-color-expense hover:text-color-expense/70"
            title="Keluar"
          >
            <span className="material-symbols-rounded text-2xl">logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
