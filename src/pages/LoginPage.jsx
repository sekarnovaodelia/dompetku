import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Email dan password harus diisi')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa email dan password Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-md">
      <div className="w-full max-w-[400px] animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-xl">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-md shadow-lg">
            <span
              className="material-symbols-rounded text-white text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              account_balance_wallet
            </span>
          </div>
          <h1 className="text-page-title font-bold text-on-surface">DompetKu</h1>
          <p className="text-body-input text-color-text-secondary mt-xs">
            Kelola keuangan Anda dengan mudah
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-md">
          {error && (
            <div className="bg-color-expense-bg border border-color-expense/30 rounded-xl p-md text-color-expense text-sm font-medium flex items-center gap-sm">
              <span className="material-symbols-rounded text-xl">error</span>
              {error}
            </div>
          )}

          <div>
            <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
              Email
            </label>
            <div className="relative">
              <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-color-text-secondary">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full h-[56px] bg-color-surface border-2 border-outline-variant rounded-xl pl-12 pr-4 text-body-input text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-color-text-secondary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-color-text-secondary">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full h-[56px] bg-color-surface border-2 border-outline-variant rounded-xl pl-12 pr-12 text-body-input text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-color-text-secondary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-color-text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-rounded">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[56px] bg-primary text-on-primary rounded-xl text-button-label font-bold flex items-center justify-center gap-sm shadow-md hover:bg-surface-tint transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {loading && (
              <span className="material-symbols-rounded animate-spin">progress_activity</span>
            )}
            Masuk
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center mt-xl text-body-input text-color-text-secondary">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="text-primary font-semibold hover:underline"
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
