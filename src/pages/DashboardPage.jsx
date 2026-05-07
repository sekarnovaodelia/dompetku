import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactions } from '../hooks/useTransactions'
import { useDebts } from '../hooks/useDebts'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { transactions } = useTransactions()
  const { debts } = useDebts()
  const [time, setTime] = useState(new Date())

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Calculate summaries for current month
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const totalIncome = monthTransactions
    .filter(t => t.type === 'pemasukan')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = monthTransactions
    .filter(t => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalDebt = debts
    .filter(d => !d.is_paid)
    .reduce((sum, d) => sum + Number(d.amount), 0)

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="flex-1 px-md pt-lg flex flex-col gap-lg pb-xl animate-fade-in">
      {/* Hero Clock & Date */}
      <section className="flex flex-col items-center justify-center pt-md pb-sm text-center">
        <h2 className="text-clock-hero font-bold text-on-surface tabular-nums">
          {formatTime(time)}
        </h2>
        <p className="text-label-caption font-semibold text-color-text-secondary mt-xs">
          {formatDate(time)}
        </p>
      </section>

      {/* Divider */}
      <hr className="border-color-border/40 -mx-md" />

      {/* Summary Cards Grid */}
      <section className="-mx-md md:mx-0 grid grid-cols-1 md:grid-cols-3 gap-md px-md md:px-0">
        {/* Pemasukan Card */}
        <div className="bg-color-income-bg rounded-xl p-md flex flex-col gap-xs ambient-shadow border border-color-border/40 border-l-4 border-l-color-income">
          <div className="flex items-center gap-xs text-color-income">
            <span
              className="material-symbols-rounded text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              arrow_downward
            </span>
            <h3 className="text-label-caption font-semibold">Pemasukan Bulan Ini</h3>
          </div>
          <p className="text-card-value font-semibold text-color-text-primary mt-sm">
            {formatRupiah(totalIncome)}
          </p>
        </div>

        {/* Pengeluaran Card */}
        <div className="bg-color-expense-bg rounded-xl p-md flex flex-col gap-xs ambient-shadow border border-color-border/40 border-l-4 border-l-color-expense">
          <div className="flex items-center gap-xs text-color-expense">
            <span
              className="material-symbols-rounded text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              arrow_upward
            </span>
            <h3 className="text-label-caption font-semibold">Pengeluaran Bulan Ini</h3>
          </div>
          <p className="text-card-value font-semibold text-color-text-primary mt-sm">
            {formatRupiah(totalExpense)}
          </p>
        </div>

        {/* Piutang Card */}
        <div className="bg-color-debt-bg rounded-xl p-md flex flex-col gap-xs ambient-shadow border border-color-border/40 border-l-4 border-l-secondary">
          <div className="flex items-center gap-xs text-secondary">
            <span
              className="material-symbols-rounded text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              handshake
            </span>
            <h3 className="text-label-caption font-semibold">Total Piutang</h3>
          </div>
          <p className="text-card-value font-semibold text-color-text-primary mt-sm">
            {formatRupiah(totalDebt)}
          </p>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-color-border/40 -mx-md" />

      {/* Primary Action Button */}
      <section className="mt-auto pt-lg">
        <button
          onClick={() => navigate('/tambah-transaksi')}
          className="w-full h-[64px] bg-primary text-on-primary text-button-label font-bold rounded-lg flex items-center justify-center gap-sm hover:bg-surface-tint active:scale-95 transition-transform shadow-[0_4px_12px_rgba(0,96,54,0.3)]"
        >
          <span
            className="material-symbols-rounded text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add_circle
          </span>
          Tambah Transaksi
        </button>
      </section>
    </div>
  )
}
