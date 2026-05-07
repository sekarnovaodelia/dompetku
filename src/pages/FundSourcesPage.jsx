import { useState } from 'react'
import { useFundSources } from '../hooks/useFundSources'
import { useTransactions } from '../hooks/useTransactions'
import { calculateBalances, formatRupiah } from '../lib/utils'

const ICON_OPTIONS = [
  { icon: 'payments', label: 'Tunai' },
  { icon: 'account_balance', label: 'Bank' },
  { icon: 'credit_card', label: 'Kartu' },
  { icon: 'savings', label: 'Tabungan' },
  { icon: 'wallet', label: 'Dompet' },
  { icon: 'currency_bitcoin', label: 'Crypto' },
]

const ICON_COLORS = [
  { bg: 'bg-color-income-bg', text: 'text-color-income' },
  { bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed-variant' },
  { bg: 'bg-color-debt-bg', text: 'text-color-debt' },
  { bg: 'bg-color-expense-bg', text: 'text-color-expense' },
]

export default function FundSourcesPage() {
  const { fundSources, loading, addFundSource, removeFundSource } = useFundSources()
  const { transactions } = useTransactions()
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newIcon, setNewIcon] = useState('account_balance_wallet')
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Hitung saldo semua sumber dana
  const balances = calculateBalances(fundSources, transactions)
  const totalBalance = Object.values(balances).reduce((sum, b) => sum + b, 0)

  const validateForm = () => {
    const errors = {}
    if (!newName.trim()) {
      errors.name = 'Nama sumber dana harus diisi'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = async () => {
    if (!validateForm()) return
    setSaving(true)
    try {
      await addFundSource({
        name: newName.trim(),
        description: newDescription.trim() || null,
        icon: newIcon,
        balance: 0
      })
      setNewName('')
      setNewDescription('')
      setNewIcon('account_balance_wallet')
      setFormErrors({})
      setShowForm(false)
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Hapus sumber dana ini?')) {
      await removeFundSource(id)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setNewName('')
    setNewDescription('')
    setNewIcon('account_balance_wallet')
    setFormErrors({})
  }

  const getColorClass = (index) => {
    return ICON_COLORS[index % ICON_COLORS.length]
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-rounded text-4xl text-color-text-secondary animate-spin">
          progress_activity
        </span>
      </div>
    )
  }

  return (
    <div className="flex-1 px-md pt-lg flex flex-col gap-lg pb-xl animate-fade-in">
      {/* Header Area */}
      <div className="space-y-sm text-center">
        <h1 className="text-page-title font-bold text-on-surface">Sumber Dana Anda</h1>
        <p className="text-body-input text-color-text-secondary">
          Kelola tempat penyimpanan uang Anda
        </p>
      </div>

      {/* Divider */}
      <hr className="border-color-border/40 -mx-md" />

      {/* Total Balance Card */}
      {fundSources.length > 0 && (
        <div className="-mx-md md:mx-0 -mt-1 px-md md:px-0 bg-color-income-bg rounded-xl py-md ambient-shadow border-l-4 border-l-color-income">
          <div className="flex items-center gap-xs text-color-income mb-sm px-lg">
            <span
              className="material-symbols-rounded text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              account_balance_wallet
            </span>
            <span className="text-label-caption font-semibold">Total Saldo Semua Dana</span>
          </div>
          <p className="text-card-value font-semibold text-color-text-primary px-lg">
            {formatRupiah(totalBalance)}
          </p>
        </div>
      )}

      {/* Add Button */}
      <div className="-mx-md md:mx-0 px-md md:px-0">
        <button
          onClick={() => setShowForm(true)}
          className="w-full min-h-[56px] bg-primary text-on-primary rounded-xl text-base font-bold flex items-center justify-center gap-sm ambient-shadow active:scale-95 transition-transform"
        >
          <span className="material-symbols-rounded">add_circle</span>
          Tambah Sumber Dana
        </button>
      </div>

      {/* Divider */}
      <hr className="border-color-border/40 -mx-md" />

      {/* Fund Sources Grid */}
      <div className="-mx-md md:mx-0 px-md md:px-0 grid grid-cols-2 gap-md">
        {fundSources.map((source, index) => {
          const colorClass = getColorClass(index)
          const balance = balances[source.id] || 0
          return (
            <div
              key={source.id}
              className="bg-color-surface rounded-xl p-lg flex flex-col items-center justify-center gap-xs border-2 border-slate-400 ring-1 ring-slate-300 shadow-[0_4px_10px_rgba(0,0,0,0.06)] hover:bg-surface-container active:scale-95 transition-transform min-h-[170px] relative group"
            >
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(source.id)
                }}
                className="absolute top-2 right-2 text-color-expense hover:text-color-expense/70 transition-colors p-1"
              >
                <span className="material-symbols-rounded text-lg">delete</span>
              </button>

              <div
                className={`w-14 h-14 rounded-full ${colorClass.bg} flex items-center justify-center ${colorClass.text} mb-1`}
              >
                <span
                  className="material-symbols-rounded text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {source.icon || 'account_balance_wallet'}
                </span>
              </div>
              <span className="text-label-caption font-semibold text-on-surface text-center">
                {source.name}
              </span>

              {/* Saldo */}
              <span className={`text-sm font-bold ${balance >= 0 ? 'text-color-income' : 'text-color-expense'}`}>
                {formatRupiah(balance)}
              </span>

              {source.description && (
                <span className="text-xs text-color-text-secondary text-center line-clamp-2 px-1">
                  {source.description}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {fundSources.length === 0 && (
        <div className="flex flex-col items-center justify-center py-xl text-center">
          <span className="material-symbols-rounded text-6xl text-color-text-secondary/30 mb-md">
            account_balance
          </span>
          <p className="text-body-input text-color-text-secondary">
            Belum ada sumber dana. Tambahkan sekarang!
          </p>
        </div>
      )}

      {/* Add Form Bottom Sheet */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center" onClick={handleCloseForm}>
          <div
            className="bg-color-surface w-full max-w-lg rounded-t-2xl p-lg animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-lg" />

            <div className="flex justify-between items-center mb-lg">
              <h2 className="text-section-title font-semibold text-on-surface">
                Tambah Sumber Dana
              </h2>
              <button
                onClick={handleCloseForm}
                className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {/* Name Input */}
            <div className="mb-md">
              <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
                Nama <span className="text-color-expense">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value)
                  if (formErrors.name) {
                    setFormErrors(prev => {
                      const copy = { ...prev }
                      delete copy.name
                      return copy
                    })
                  }
                }}
                placeholder="Contoh: Dompet Tunai, BCA, OVO..."
                className={`w-full h-[56px] bg-surface-container-low border-2 rounded-xl px-md text-body-input text-on-surface focus:outline-none focus:ring-2 placeholder:text-color-text-secondary/80 transition-colors ${
                  formErrors.name
                    ? 'border-color-expense focus:border-color-expense focus:ring-color-expense/20'
                    : 'border-outline-variant focus:border-primary focus:ring-primary/20'
                }`}
              />
              {formErrors.name && (
                <div className="flex items-center gap-xs mt-xs text-color-expense animate-fade-in">
                  <span className="material-symbols-rounded text-base">error</span>
                  <span className="text-sm font-medium">{formErrors.name}</span>
                </div>
              )}
            </div>

            {/* Description Input */}
            <div className="mb-lg">
              <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
                Deskripsi <span className="text-color-text-secondary/50">(Opsional)</span>
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Contoh: Rekening utama untuk gaji bulanan..."
                rows={2}
                className="w-full bg-surface-container-low border-2 border-outline-variant rounded-xl px-md py-sm text-body-input text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-color-text-secondary/80 resize-none"
              />
            </div>

            {/* Icon Selection */}
            <div className="mb-lg">
              <label className="block text-label-caption font-semibold text-color-text-secondary mb-sm">
                Ikon
              </label>
              <div className="grid grid-cols-3 gap-sm">
                {ICON_OPTIONS.map(opt => (
                  <button
                    key={opt.icon}
                    onClick={() => setNewIcon(opt.icon)}
                    className={`h-[56px] rounded-xl flex items-center justify-center gap-xs transition-all ${
                      newIcon === opt.icon
                        ? 'bg-primary text-on-primary shadow-md'
                        : 'bg-surface-container-low text-color-text-secondary border border-outline-variant'
                    }`}
                  >
                    <span className="material-symbols-rounded">{opt.icon}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleAdd}
              disabled={saving}
              className="w-full h-[56px] bg-primary text-on-primary rounded-xl text-button-label font-bold flex items-center justify-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              {saving && (
                <span className="material-symbols-rounded animate-spin">progress_activity</span>
              )}
              Simpan
            </button>
          </div>
        </div>
      )}


    </div>
  )
}
