import { useState } from 'react'
import { useDebts } from '../hooks/useDebts'
import { useFundSources } from '../hooks/useFundSources'
import { useTransactions } from '../hooks/useTransactions'
import { calculateBalances, formatRupiah, formatNumber, parseNumber } from '../lib/utils'

export default function DebtPage() {
  const { debts, loading, addDebt, markAsPaid, removeDebt } = useDebts()
  const { fundSources } = useFundSources()
  const { transactions, addTransaction } = useTransactions()
  const [showPaid, setShowPaid] = useState(false)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [personName, setPersonName] = useState('')
  const [amountRaw, setAmountRaw] = useState('')
  const [amountDisplay, setAmountDisplay] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedFundSource, setSelectedFundSource] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Pay modal
  const [showPayModal, setShowPayModal] = useState(false)
  const [payDebtId, setPayDebtId] = useState(null)
  const [payFundSource, setPayFundSource] = useState(null)

  const activeDebts = debts.filter(d => !d.is_paid)
  const paidDebts = debts.filter(d => d.is_paid)
  const totalActive = activeDebts.reduce((sum, d) => sum + Number(d.amount), 0)

  // Hitung saldo sumber dana
  const balances = calculateBalances(fundSources, transactions)

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleAmountChange = (e) => {
    const raw = parseNumber(e.target.value)
    if (raw === '') { setAmountRaw(''); setAmountDisplay(''); return }
    if (raw.length > 15) return
    setAmountRaw(raw)
    setAmountDisplay(formatNumber(raw))
  }

  const clearError = (field) => {
    if (formErrors[field]) {
      setFormErrors(prev => { const c = { ...prev }; delete c[field]; return c })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!personName.trim()) errors.personName = 'Nama orang harus diisi'
    if (!amountRaw || Number(amountRaw) <= 0) errors.amount = 'Jumlah harus lebih dari 0'
    if (!selectedFundSource) errors.fundSource = 'Pilih sumber dana asal uang piutang'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setPersonName(''); setAmountRaw(''); setAmountDisplay('')
    setNote(''); setDate(new Date().toISOString().split('T')[0])
    setSelectedFundSource(null); setFormErrors({})
  }

  const handleCloseForm = () => { setShowForm(false); resetForm() }

  const handleSave = async () => {
    if (!validateForm()) return
    setSaving(true)
    try {
      const amount = Number(amountRaw)
      // Simpan piutang
      await addDebt({
        person_name: personName.trim(),
        amount,
        note: note.trim() || null,
        date,
        is_paid: false
      })
      // Otomatis buat transaksi pengeluaran (uang keluar ke orang yg hutang)
      await addTransaction({
        name: `Piutang: ${personName.trim()}`,
        amount,
        type: 'pengeluaran',
        fund_source_id: selectedFundSource,
        date,
        time: new Date().toTimeString().split(' ')[0],
        note: `Piutang ke ${personName.trim()}${note.trim() ? ' - ' + note.trim() : ''}`
      })
      handleCloseForm()
    } catch (err) {
      console.error('Failed to save debt:', err)
    } finally {
      setSaving(false)
    }
  }

  // Tandai lunas - pilih sumber dana dulu
  const openPayModal = (debtId) => {
    setPayDebtId(debtId)
    setPayFundSource(null)
    setShowPayModal(true)
  }

  const handleConfirmPay = async () => {
    if (!payFundSource) return
    const debt = debts.find(d => d.id === payDebtId)
    // Tandai lunas
    await markAsPaid(payDebtId)
    // Otomatis buat transaksi pemasukan (uang masuk dari orang yg bayar)
    if (debt) {
      await addTransaction({
        name: `Lunas: ${debt.person_name}`,
        amount: Number(debt.amount),
        type: 'pemasukan',
        fund_source_id: payFundSource,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        note: `Pembayaran piutang dari ${debt.person_name}`
      })
    }
    setShowPayModal(false)
    setPayDebtId(null)
    setPayFundSource(null)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Hapus piutang ini?')) {
      await removeDebt(id)
    }
  }

  const payDebt = payDebtId ? debts.find(d => d.id === payDebtId) : null

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
      {/* Header */}
      <div className="space-y-sm text-center">
        <h1 className="text-page-title font-bold text-on-surface">Piutang</h1>
        <p className="text-body-input text-color-text-secondary">
          Kelola catatan piutang Anda
        </p>
      </div>

      {/* Divider */}
      <hr className="border-color-border/40 -mx-md" />

      {/* Total Summary */}
      <div className="-mx-md md:mx-0 -mt-1 px-md md:px-0 bg-color-debt-bg rounded-xl py-md ambient-shadow border-l-4 border-l-secondary">
        <div className="flex items-center gap-xs text-secondary mb-sm px-lg">
          <span className="material-symbols-rounded text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance
          </span>
          <span className="text-label-caption font-semibold">Total Piutang Aktif</span>
        </div>
        <p className="text-card-value font-semibold text-color-text-primary px-lg">
          {formatRupiah(totalActive)}
        </p>
      </div>

      {/* Add Button */}
      <div className="-mx-md md:mx-0 px-md md:px-0">
        <button
          onClick={() => setShowForm(true)}
          className="w-full min-h-[56px] bg-secondary text-on-secondary rounded-xl text-base font-bold flex items-center justify-center gap-sm ambient-shadow active:scale-95 transition-transform"
        >
          <span className="material-symbols-rounded">add_circle</span>
          Tambah Piutang
        </button>
      </div>

      {/* Divider */}
      <hr className="border-color-border/40 -mx-md" />

      {/* Toggle */}
      <div className="flex -mx-md md:mx-0 px-md md:px-0 mb-lg bg-color-surface md:bg-transparent">
        <button
          onClick={() => setShowPaid(false)}
          className={`flex-1 h-[48px] rounded-xl font-semibold text-base flex items-center justify-center transition-all ${
            !showPaid ? 'bg-secondary text-white shadow-md' : 'bg-surface-container-low md:bg-color-surface text-color-text-secondary border-b-2 md:border-2 border-outline-variant'
          }`}
        >
          Belum Lunas ({activeDebts.length})
        </button>
        <button
          onClick={() => setShowPaid(true)}
          className={`flex-1 h-[48px] rounded-xl font-semibold text-base flex items-center justify-center transition-all ${
            showPaid ? 'bg-color-success text-white shadow-md' : 'bg-surface-container-low md:bg-color-surface text-color-text-secondary border-b-2 md:border-2 border-outline-variant'
          }`}
        >
          Lunas ({paidDebts.length})
        </button>
      </div>

      {/* Debt List */}
      <div className="-mx-md md:mx-0 -mt-1 px-md md:px-0 space-y-sm">
        {(showPaid ? paidDebts : activeDebts).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <span className="material-symbols-rounded text-6xl text-color-text-secondary/30 mb-md">
              {showPaid ? 'task_alt' : 'person_search'}
            </span>
            <p className="text-body-input text-color-text-secondary">
              {showPaid ? 'Belum ada piutang lunas' : 'Belum ada piutang'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {(showPaid ? paidDebts : activeDebts).map(debt => (
              <div key={debt.id} className="bg-color-surface rounded-xl p-md border-2 border-slate-400 ring-1 ring-slate-300 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
                <div className="flex items-start justify-between">
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-full bg-color-debt-bg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-rounded text-secondary text-xl">person</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-on-surface">{debt.person_name}</span>
                    <span className="text-xs text-color-text-secondary">{formatDate(debt.date)}</span>
                    {debt.note && <span className="text-xs text-color-text-secondary/70 mt-0.5">{debt.note}</span>}
                  </div>
                </div>
                <span className="text-sm font-bold text-secondary">{formatRupiah(debt.amount)}</span>
              </div>

              <div className="flex gap-sm mt-sm pt-sm border-t border-color-border/30">
                {!debt.is_paid && (
                  <button
                    onClick={() => openPayModal(debt.id)}
                    className="flex-1 h-[36px] rounded-lg bg-color-success/10 text-color-success font-semibold text-xs flex items-center justify-center gap-xs hover:bg-color-success/20 transition-colors"
                  >
                    <span className="material-symbols-rounded text-lg">check_circle</span>
                    Tandai Lunas
                  </button>
                )}
                <button
                  onClick={() => handleDelete(debt.id)}
                  className="h-[36px] px-md rounded-lg bg-color-expense/10 text-color-expense font-semibold text-xs flex items-center justify-center gap-xs hover:bg-color-expense/20 transition-colors"
                >
                  <span className="material-symbols-rounded text-lg">delete</span>
                  Hapus
                </button>
              </div>
            </div>
          ))
          }
          </div>
        )}
      </div>

      {/* ===== Pay Modal - Pilih sumber dana untuk terima uang ===== */}
      {showPayModal && payDebt && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center" onClick={() => setShowPayModal(false)}>
          <div className="bg-color-surface w-full max-w-lg rounded-t-2xl p-lg animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-lg" />

            <h2 className="text-section-title font-semibold text-on-surface mb-xs">Terima Pembayaran</h2>
            <p className="text-sm text-color-text-secondary mb-md">
              <strong>{payDebt.person_name}</strong> membayar <strong>{formatRupiah(payDebt.amount)}</strong>. Masukkan ke sumber dana mana?
            </p>

            <div className="flex flex-col gap-sm mb-lg">
              {fundSources.map(source => {
                const isSelected = payFundSource === source.id
                const balance = balances[source.id] || 0
                const afterBalance = balance + Number(payDebt.amount)
                return (
                  <button
                    key={source.id}
                    onClick={() => setPayFundSource(source.id)}
                    className={`rounded-xl flex items-center px-md py-3 w-full text-left transition-all ${
                      isSelected
                        ? 'border-2 border-color-success bg-color-income-bg shadow-md'
                        : 'bg-color-surface border border-outline-variant ambient-shadow'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-sm ${isSelected ? 'bg-white shadow-sm' : 'bg-surface-container-high'}`}>
                      <span className="material-symbols-rounded" style={{ color: isSelected ? '#1aad55' : '#2D5A3D', fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>
                        {source.icon || 'account_balance_wallet'}
                      </span>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <span className={`text-sm font-semibold ${isSelected ? 'text-color-income' : 'text-on-surface'}`}>{source.name}</span>
                      <span className="text-xs text-color-text-secondary">Saldo: {formatRupiah(balance)}</span>
                      {isSelected && (
                        <span className="text-xs font-semibold text-color-income mt-0.5">
                          Setelah: {formatRupiah(afterBalance)}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="material-symbols-rounded text-color-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </button>
                )
              })}
              {fundSources.length === 0 && (
                <p className="text-sm text-color-text-secondary text-center py-md">Belum ada sumber dana</p>
              )}
            </div>

            <button
              onClick={handleConfirmPay}
              disabled={!payFundSource}
              className="w-full h-[52px] bg-color-success text-white rounded-xl text-button-label font-bold flex items-center justify-center gap-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              <span className="material-symbols-rounded">check_circle</span>
              Konfirmasi Lunas
            </button>
          </div>
        </div>
      )}

      {/* ===== Add Form Bottom Sheet ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center" onClick={handleCloseForm}>
          <div className="bg-color-surface w-full max-w-lg rounded-t-2xl p-lg animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-lg" />

            <div className="flex justify-between items-center mb-lg">
              <h2 className="text-section-title font-semibold text-on-surface">Tambah Piutang</h2>
              <button onClick={handleCloseForm} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {/* Person Name */}
            <div className="mb-md">
              <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
                Nama Orang <span className="text-color-expense">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-color-text-secondary">person</span>
                <input
                  type="text" value={personName}
                  onChange={e => { setPersonName(e.target.value); clearError('personName') }}
                  placeholder="Nama yang berhutang..."
                  className={`w-full h-[52px] bg-surface-container-low border-2 rounded-xl pl-11 pr-4 text-base text-on-surface focus:outline-none focus:ring-2 placeholder:text-color-text-secondary/80 ${
                    formErrors.personName ? 'border-color-expense focus:border-color-expense focus:ring-color-expense/20' : 'border-outline-variant focus:border-secondary focus:ring-secondary/20'
                  }`}
                />
              </div>
              {formErrors.personName && (
                <div className="flex items-center gap-xs mt-xs text-color-expense animate-fade-in">
                  <span className="material-symbols-rounded text-base">error</span>
                  <span className="text-xs font-medium">{formErrors.personName}</span>
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="mb-md">
              <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
                Jumlah <span className="text-color-expense">*</span>
              </label>
              <div className={`flex items-center h-[52px] bg-surface-container-low border-2 rounded-xl px-4 gap-2 ${
                formErrors.amount ? 'border-color-expense' : 'border-outline-variant focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20'
              }`}>
                <span className="text-lg font-bold text-color-text-primary">Rp</span>
                <input
                  type="text" inputMode="numeric" value={amountDisplay}
                  onChange={e => { handleAmountChange(e); clearError('amount') }}
                  placeholder="0"
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-color-text-primary outline-none placeholder:text-color-text-secondary/80"
                />
              </div>
              {formErrors.amount && (
                <div className="flex items-center gap-xs mt-xs text-color-expense animate-fade-in">
                  <span className="material-symbols-rounded text-base">error</span>
                  <span className="text-xs font-medium">{formErrors.amount}</span>
                </div>
              )}
            </div>

            {/* Sumber Dana - uang piutang diambil dari mana */}
            <div className="mb-md">
              <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
                Uang Diambil Dari <span className="text-color-expense">*</span>
              </label>
              <p className="text-xs text-color-text-secondary mb-sm">
                Pilih sumber dana tempat uang piutang dikeluarkan
              </p>
              <div className="flex flex-col gap-xs">
                {fundSources.map(source => {
                  const isSelected = selectedFundSource === source.id
                  const balance = balances[source.id] || 0
                  const afterBalance = balance - Number(amountRaw || 0)
                  return (
                    <button
                      key={source.id}
                      onClick={() => { setSelectedFundSource(isSelected ? null : source.id); clearError('fundSource') }}
                      className={`rounded-xl flex items-center px-3 py-2.5 w-full text-left transition-all ${
                        isSelected ? 'border-2 border-secondary bg-color-debt-bg shadow-sm' : 'bg-surface-container-low border border-outline-variant'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-sm ${isSelected ? 'bg-white shadow-sm' : 'bg-surface-container-high'}`}>
                        <span className="material-symbols-rounded text-lg" style={{ color: isSelected ? '#1a73b5' : '#2D5A3D' }}>
                          {source.icon || 'account_balance_wallet'}
                        </span>
                      </div>
                      <div className="flex flex-col flex-grow">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-secondary' : 'text-on-surface'}`}>{source.name}</span>
                        <span className="text-xs text-color-text-secondary">Saldo: {formatRupiah(balance)}</span>
                        {isSelected && amountRaw && (
                          <span className={`text-xs font-semibold mt-0.5 ${afterBalance < 0 ? 'text-color-expense' : 'text-color-income'}`}>
                            Sisa: {formatRupiah(afterBalance)} {afterBalance < 0 && '⚠️'}
                          </span>
                        )}
                      </div>
                      {isSelected && <span className="material-symbols-rounded text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                    </button>
                  )
                })}
                {fundSources.length === 0 && <p className="text-xs text-color-text-secondary text-center py-sm">Belum ada sumber dana</p>}
              </div>
              {formErrors.fundSource && (
                <div className="flex items-center gap-xs mt-xs text-color-expense animate-fade-in">
                  <span className="material-symbols-rounded text-base">error</span>
                  <span className="text-xs font-medium">{formErrors.fundSource}</span>
                </div>
              )}
            </div>

            {/* Date */}
            <div className="mb-md">
              <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">Tanggal</label>
              <div className="flex items-center h-[52px] bg-surface-container-low border-2 border-outline-variant rounded-xl px-4 gap-2 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20">
                <span className="material-symbols-rounded text-color-text-secondary">calendar_today</span>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-base text-color-text-primary outline-none" />
              </div>
            </div>

            {/* Note */}
            <div className="mb-lg">
              <label className="block text-label-caption font-semibold text-color-text-secondary mb-xs">
                Keterangan <span className="text-color-text-secondary/50">(Opsional)</span>
              </label>
              <div className="flex items-center h-[52px] bg-surface-container-low border-2 border-outline-variant rounded-xl px-4 gap-2 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20">
                <span className="material-symbols-rounded text-color-text-secondary">notes</span>
                <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Tulis keterangan..."
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-base text-color-text-primary outline-none placeholder:text-color-text-secondary/80" />
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave} disabled={saving}
              className="w-full h-[52px] bg-secondary text-on-secondary rounded-xl text-button-label font-bold flex items-center justify-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              {saving && <span className="material-symbols-rounded animate-spin">progress_activity</span>}
              Simpan Piutang
            </button>
          </div>
        </div>
      )}


    </div>
  )
}
