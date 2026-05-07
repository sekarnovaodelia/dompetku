import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebts } from '../hooks/useDebts'

// Format angka dengan titik separator (1.000.000)
function formatNumber(value) {
  if (!value) return ''
  return Number(value).toLocaleString('id-ID')
}

// Parse angka dari format titik ke number
function parseNumber(formatted) {
  return formatted.replace(/\./g, '').replace(/[^0-9]/g, '')
}

export default function AddDebtPage() {
  const navigate = useNavigate()
  const { addDebt } = useDebts()

  const [personName, setPersonName] = useState('')
  const [amountRaw, setAmountRaw] = useState('')
  const [amountDisplay, setAmountDisplay] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

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

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!personName.trim()) {
      newErrors.personName = 'Nama orang harus diisi'
    }
    if (!amountRaw || Number(amountRaw) <= 0) {
      newErrors.amount = 'Jumlah harus diisi dan lebih dari 0'
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
      await addDebt({
        person_name: personName.trim(),
        amount: Number(amountRaw),
        note: note.trim() || null,
        date,
        is_paid: false
      })
      navigate('/piutang')
    } catch (err) {
      console.error('Failed to save debt:', err)
    } finally {
      setSaving(false)
    }
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
        {/* Page Title */}
        <h1 className="text-page-title font-bold text-secondary mb-xl mt-sm">
          Tambah Piutang
        </h1>

        {/* Person Name */}
        <section
          className={`bg-color-surface rounded-xl ambient-shadow p-lg mb-lg border border-color-border/40 border-l-4 ${
            errors.personName ? 'border-l-color-expense' : 'border-l-secondary'
          }`}
        >
          <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
            Nama Orang <span className="text-color-expense">*</span>
          </label>
          <div className="flex items-center border-b-2 border-outline-variant pb-xs transition-colors">
            <span className="material-symbols-rounded text-color-text-secondary mr-sm">person</span>
            <input
              type="text"
              value={personName}
              onChange={(e) => {
                setPersonName(e.target.value)
                clearError('personName')
              }}
              placeholder="Nama yang berhutang..."
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-input text-color-text-primary outline-none placeholder:text-color-text-secondary/80"
            />
          </div>
          {errors.personName && (
            <div className="flex items-center gap-xs mt-sm text-color-expense animate-fade-in">
              <span className="material-symbols-rounded text-lg">error</span>
              <span className="text-sm font-medium">{errors.personName}</span>
            </div>
          )}
        </section>

        {/* Divider */}
        <hr className="border-color-border/30 mb-lg" />

        {/* Amount */}
        <section
          className={`bg-color-surface rounded-xl ambient-shadow p-lg mb-lg border border-color-border/40 border-l-4 ${
            errors.amount ? 'border-l-color-expense' : 'border-l-secondary'
          }`}
        >
          <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
            Jumlah Piutang <span className="text-color-expense">*</span>
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
        </section>

        {/* Divider */}
        <hr className="border-color-border/30 mb-lg" />

        {/* Date & Note */}
        <section className="bg-color-surface rounded-xl ambient-shadow border border-color-border/40 p-md mb-xl flex flex-col gap-lg">
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
            className="w-full h-[64px] bg-secondary text-on-secondary text-button-label font-bold rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {saving ? (
              <span className="material-symbols-rounded animate-spin mr-sm">progress_activity</span>
            ) : null}
            Simpan Piutang
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
