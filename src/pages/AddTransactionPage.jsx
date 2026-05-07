import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTransactions } from '../hooks/useTransactions'
import { useFundSources } from '../hooks/useFundSources'
import { calculateBalances, formatRupiah, formatNumber, parseNumber } from '../lib/utils'

export default function AddTransactionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { transactions, addTransaction } = useTransactions()
  const { fundSources } = useFundSources()

  const initialType = searchParams.get('type') || 'pemasukan'
  const [type, setType] = useState(initialType)
  const [amountRaw, setAmountRaw] = useState('')
  const [amountDisplay, setAmountDisplay] = useState('')
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedFundSource, setSelectedFundSource] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const isIncome = type === 'pemasukan'
  const themeColorValue = isIncome ? '#009950' : '#e03025'

  // Hitung saldo setiap sumber dana
  const balances = calculateBalances(fundSources, transactions)

  // Handle amount input - number only with dot separator
  const handleAmountChange = (e) => {
    const raw = parseNumber(e.target.value)
    if (raw === '') {
      setAmountRaw('')
      setAmountDisplay('')
      return
    }
    if (raw.length > 15) return
    setAmountRaw(raw)
    setAmountDisplay(formatNumber(raw))
  }

  // Validate all fields
  const validate = () => {
    const newErrors = {}
    if (!name.trim()) {
      newErrors.name = 'Nama transaksi harus diisi'
    }
    if (!amountRaw || Number(amountRaw) <= 0) {
      newErrors.amount = 'Jumlah harus diisi dan lebih dari 0'
    }
    if (!selectedFundSource) {
      newErrors.fundSource = `Pilih sumber dana untuk ${isIncome ? 'menyimpan' : 'mengambil'} uang`
    }
    if (!date) {
      newErrors.date = 'Tanggal harus diisi'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await addTransaction({
        name: name.trim(),
        amount: Number(amountRaw),
        type,
        fund_source_id: selectedFundSource,
        date,
        time: new Date().toTimeString().split(' ')[0],
        note: note.trim() || null
      })
      navigate('/')
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  // Hitung sisa saldo setelah transaksi ini
  const getBalanceAfter = (sourceId) => {
    const current = balances[sourceId] || 0
    const amount = Number(amountRaw) || 0
    if (isIncome) return current + amount
    return current - amount
  }

  return (
    <div className="bg-background text-on-background min-h-screen pb-[120px] animate-fade-in">
      {/* Header / Back */}
      <header className="flex items-center justify-between px-md py-md bg-surface sticky top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-[48px] h-[48px] rounded-full hover:bg-surface-container-high transition-colors text-on-surface"
        >
          <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>
            arrow_back
          </span>
        </button>
        <div className="w-[48px]" />
      </header>

      <main className="px-md max-w-[600px] mx-auto">
        {/* Type Toggle */}
        <div className="flex gap-sm mb-lg">
          <button
            onClick={() => setType('pemasukan')}
            className={`flex-1 h-[56px] rounded-xl font-semibold text-lg flex items-center justify-center gap-xs transition-all ${
              isIncome
                ? 'bg-color-income text-white shadow-md'
                : 'bg-color-surface text-color-text-secondary border-2 border-outline-variant'
            }`}
          >
            <span className="material-symbols-rounded">arrow_downward</span>
            Pemasukan
          </button>
          <button
            onClick={() => setType('pengeluaran')}
            className={`flex-1 h-[56px] rounded-xl font-semibold text-lg flex items-center justify-center gap-xs transition-all ${
              !isIncome
                ? 'bg-color-expense text-white shadow-md'
                : 'bg-color-surface text-color-text-secondary border-2 border-outline-variant'
            }`}
          >
            <span className="material-symbols-rounded">arrow_upward</span>
            Pengeluaran
          </button>
        </div>

        {/* Page Title */}
        <h1
          className="text-page-title font-bold mb-xl mt-sm"
          style={{ color: themeColorValue }}
        >
          {isIncome ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
        </h1>

        {/* === STEP 1: Sumber Dana (Pilih Dulu) === */}
        <section className="mb-lg">
          <div className="flex items-center gap-xs mb-md">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: themeColorValue }}
            >
              1
            </div>
            <h2 className="text-section-title font-semibold text-on-surface">
              {isIncome ? 'Simpan Ke' : 'Ambil Dari'}
            </h2>
          </div>
          <p className="text-sm text-color-text-secondary mb-md ml-10">
            {isIncome
              ? 'Pilih sumber dana tempat uang akan disimpan'
              : 'Pilih sumber dana tempat uang akan diambil'}
          </p>

          {fundSources.length > 0 ? (
            <div className="flex flex-col gap-sm">
              {fundSources.map(source => {
                const isSelected = selectedFundSource === source.id
                const currentBalance = balances[source.id] || 0
                const balanceAfter = getBalanceAfter(source.id)
                return (
                  <button
                    key={source.id}
                    onClick={() => {
                      setSelectedFundSource(isSelected ? null : source.id)
                      clearError('fundSource')
                    }}
                    className={`rounded-xl flex items-center px-md py-3 w-full text-left transition-all ${
                      isSelected
                        ? 'border-2 shadow-md'
                        : 'bg-color-surface border border-outline-variant ambient-shadow'
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: themeColorValue,
                            backgroundColor: isIncome ? '#e8f5ee' : '#fdecea'
                          }
                        : {}
                    }
                  >
                    <div
                      className={`w-[44px] h-[44px] rounded-full flex items-center justify-center mr-sm ${
                        isSelected ? 'bg-color-surface shadow-sm' : 'bg-surface-container-high'
                      }`}
                    >
                      <span
                        className="material-symbols-rounded"
                        style={{
                          color: isSelected ? themeColorValue : '#2D5A3D',
                          fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0"
                        }}
                      >
                        {source.icon || 'account_balance_wallet'}
                      </span>
                    </div>
                    <div className="flex flex-col flex-grow min-w-0">
                      <span
                        className="text-base font-semibold truncate"
                        style={{ color: isSelected ? themeColorValue : '#1a1a2e' }}
                      >
                        {source.name}
                      </span>
                      <span className="text-xs text-color-text-secondary">
                        Saldo: {formatRupiah(currentBalance)}
                      </span>
                      {/* Tampilkan sisa setelah transaksi jika ada amount */}
                      {isSelected && amountRaw && (
                        <span className={`text-xs font-semibold mt-0.5 ${
                          balanceAfter < 0 ? 'text-color-expense' : 'text-color-income'
                        }`}>
                          {isIncome ? 'Setelah' : 'Sisa'}: {formatRupiah(balanceAfter)}
                          {balanceAfter < 0 && ' ⚠️'}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span
                        className="material-symbols-rounded flex-shrink-0"
                        style={{ color: themeColorValue, fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="bg-color-surface rounded-xl ambient-shadow p-lg text-center">
              <span className="material-symbols-rounded text-4xl text-color-text-secondary/40 mb-sm block">
                account_balance
              </span>
              <p className="text-color-text-secondary text-sm mb-md">
                Belum ada sumber dana. Tambahkan dulu di menu Sumber Dana.
              </p>
              <button
                onClick={() => navigate('/sumber-dana')}
                className="text-primary font-semibold text-sm hover:underline"
              >
                + Tambah Sumber Dana
              </button>
            </div>
          )}

          {errors.fundSource && (
            <div className="flex items-center gap-xs mt-sm text-color-expense animate-fade-in">
              <span className="material-symbols-rounded text-lg">error</span>
              <span className="text-sm font-medium">{errors.fundSource}</span>
            </div>
          )}
        </section>

        {/* Divider */}
        <hr className="border-color-border/30 mb-lg" />

        {/* === STEP 2: Nama Transaksi === */}
        <section className="mb-lg">
          <div className="flex items-center gap-xs mb-md">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: themeColorValue }}
            >
              2
            </div>
            <h2 className="text-section-title font-semibold text-on-surface">
              Detail Transaksi
            </h2>
          </div>

          <div
            className={`bg-color-surface rounded-xl ambient-shadow p-lg border border-color-border/40 border-l-4 ${
              errors.name ? 'border-color-expense' : ''
            }`}
            style={!errors.name ? { borderLeftColor: themeColorValue } : {}}
          >
            <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
              Nama Transaksi
            </label>
            <div className="flex items-center border-b-2 border-outline-variant pb-xs transition-colors">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  clearError('name')
                }}
                placeholder="Contoh: Gaji, Makan siang..."
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-input text-color-text-primary outline-none placeholder:text-color-text-secondary/80"
              />
            </div>
            {errors.name && (
              <div className="flex items-center gap-xs mt-sm text-color-expense animate-fade-in">
                <span className="material-symbols-rounded text-lg">error</span>
                <span className="text-sm font-medium">{errors.name}</span>
              </div>
            )}
          </div>
        </section>

        {/* Divider */}
        <hr className="border-color-border/30 mb-lg" />

        {/* === STEP 3: Jumlah === */}
        <section className="mb-lg">
          <div className="flex items-center gap-xs mb-md">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: themeColorValue }}
            >
              3
            </div>
            <h2 className="text-section-title font-semibold text-on-surface">
              Jumlah
            </h2>
          </div>

          <div
            className={`bg-color-surface rounded-xl ambient-shadow p-lg border border-color-border/40 border-l-4 ${
              errors.amount ? 'border-color-expense' : ''
            }`}
            style={!errors.amount ? { borderLeftColor: themeColorValue } : {}}
          >
            <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
              {isIncome ? 'Jumlah Pemasukan' : 'Jumlah Pengeluaran'}
            </label>
            <div className="flex items-center border-b-2 border-outline-variant pb-xs transition-colors">
              <span className="text-card-value font-semibold text-color-text-primary mr-sm">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={(e) => {
                  handleAmountChange(e)
                  clearError('amount')
                }}
                placeholder="0"
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-card-value font-semibold text-color-text-primary outline-none placeholder:text-color-text-secondary/80"
              />
            </div>
            {errors.amount && (
              <div className="flex items-center gap-xs mt-sm text-color-expense animate-fade-in">
                <span className="material-symbols-rounded text-lg">error</span>
                <span className="text-sm font-medium">{errors.amount}</span>
              </div>
            )}
          </div>
        </section>

        {/* Divider */}
        <hr className="border-color-border/30 mb-lg" />

        {/* === STEP 4: Tanggal & Keterangan === */}
        <section className="mb-xl">
          <div className="flex items-center gap-xs mb-md">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: themeColorValue }}
            >
              4
            </div>
            <h2 className="text-section-title font-semibold text-on-surface">
              Tanggal & Catatan
            </h2>
          </div>

          <div className="bg-color-surface rounded-xl ambient-shadow border border-color-border/40 p-md flex flex-col gap-lg">
            <div>
              <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
                Tanggal
              </label>
              <div className="h-[56px] border-b-2 border-outline-variant flex items-center transition-colors px-xs">
                <span className="material-symbols-rounded text-color-text-secondary mr-sm">
                  calendar_today
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-input text-color-text-primary outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
                Keterangan (Opsional)
              </label>
              <div className="h-[56px] border-b-2 border-outline-variant flex items-center transition-colors px-xs">
                <span className="material-symbols-rounded text-color-text-secondary mr-sm">
                  notes
                </span>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tulis keterangan di sini..."
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-input text-color-text-primary outline-none placeholder:text-color-text-secondary/70"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-color-expense-bg border border-color-expense/30 rounded-xl p-md mb-lg flex items-start gap-sm animate-fade-in">
            <span className="material-symbols-rounded text-color-expense text-xl mt-0.5">warning</span>
            <div>
              <p className="text-color-expense font-semibold text-sm">
                Mohon lengkapi data berikut:
              </p>
              <ul className="text-color-expense/80 text-sm mt-xs list-disc ml-4">
                {Object.values(errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-md pb-lg">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-[64px] text-on-primary text-button-label font-bold rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
            style={{ backgroundColor: themeColorValue }}
          >
            {saving ? (
              <span className="material-symbols-rounded animate-spin mr-sm">progress_activity</span>
            ) : null}
            {isIncome ? 'Simpan Pemasukan' : 'Simpan Pengeluaran'}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full h-[64px] bg-color-surface text-color-text-secondary text-button-label font-bold rounded-lg border-2 border-outline-variant hover:bg-surface-container transition-colors flex items-center justify-center"
          >
            Batal
          </button>
        </div>
      </main>
    </div>
  )
}
