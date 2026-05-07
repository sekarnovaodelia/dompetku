import { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'

export default function HistoryPage() {
  const { transactions, loading, removeTransaction } = useTransactions()
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showAll, setShowAll] = useState(false)

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q))
      )
    }

    if (dateFilter) {
      filtered = filtered.filter(t => t.date === dateFilter)
    }

    // Sort by date desc, then created_at desc
    filtered.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date)
      if (dateCompare !== 0) return dateCompare
      return new Date(b.created_at) - new Date(a.created_at)
    })

    return filtered
  }, [transactions, searchQuery, dateFilter])

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups = {}
    const displayData = showAll ? filteredTransactions : filteredTransactions.slice(0, 20)

    displayData.forEach(t => {
      const dateKey = t.date
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(t)
    })

    return groups
  }, [filteredTransactions, showAll])

  const formatGroupDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Hari Ini'
    if (date.toDateString() === yesterday.toDateString()) return 'Kemarin'

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getTransactionIcon = (type, name) => {
    if (type === 'pemasukan') return 'payments'
    // Simple icon matching based on name
    const lower = name.toLowerCase()
    if (lower.includes('makan') || lower.includes('food')) return 'restaurant'
    if (lower.includes('belanja') || lower.includes('shop')) return 'shopping_cart'
    if (lower.includes('bensin') || lower.includes('transport')) return 'directions_car'
    if (lower.includes('obat') || lower.includes('apotek')) return 'local_pharmacy'
    if (lower.includes('listrik') || lower.includes('air') || lower.includes('wifi')) return 'bolt'
    return 'receipt_long'
  }

  const handleDelete = async (id) => {
    if (window.confirm('Hapus transaksi ini?')) {
      await removeTransaction(id)
    }
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
    <div className="max-w-3xl mx-auto px-md md:px-lg pb-lg animate-fade-in">
      {/* Search and Filter Section */}
      <section className="space-y-md mt-4">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <span className="material-symbols-rounded absolute left-4 text-color-text-secondary text-2xl">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan deskripsi..."
            className="w-full bg-color-surface border-2 border-color-border/50 rounded-xl py-4 pl-12 pr-4 text-base text-on-surface focus:outline-none focus:border-color-income focus:ring-2 focus:ring-color-income/20 placeholder:text-color-text-secondary/70 shadow-sm transition-all"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center justify-between bg-color-surface border-2 border-color-border/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-rounded text-color-text-secondary">
                calendar_month
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-caption font-semibold text-color-text-secondary">
                Pilih Tanggal
              </span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent border-none p-0 text-base font-bold text-on-surface outline-none focus:ring-0"
              />
            </div>
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-color-text-secondary hover:text-color-expense"
            >
              <span className="material-symbols-rounded">close</span>
            </button>
          )}
        </div>
      </section>

      {/* Divider */}
      <hr className="border-color-border/40 -mx-md mt-lg" />

      {/* Page Title */}
      <section className="mb-lg mt-lg">
        <h2 className="text-page-title font-bold text-on-surface">Riwayat Transaksi</h2>
      </section>

      {/* Transaction Groups */}
      {Object.keys(groupedTransactions).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-xl text-center">
          <span className="material-symbols-rounded text-6xl text-color-text-secondary/30 mb-md">
            receipt_long
          </span>
          <p className="text-body-input text-color-text-secondary">
            {searchQuery || dateFilter ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
          </p>
        </div>
      ) : (
        Object.entries(groupedTransactions).map(([dateKey, items]) => (
          <section key={dateKey} className="space-y-sm mb-lg">
            <h3 className="text-base font-semibold text-color-text-secondary sticky top-[64px] bg-color-background/90 backdrop-blur py-sm z-10 border-b-2 border-color-border/50 -mx-md px-md">
              {formatGroupDate(dateKey)}
            </h3>
            <div className="bg-color-surface rounded-xl ambient-shadow overflow-hidden border border-color-border/50">
              {items.map((t, idx) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between px-3 py-2.5 min-h-[52px] ${
                    idx < items.length - 1 ? 'border-b border-color-border/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-sm min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        t.type === 'pemasukan' ? 'bg-color-income-bg' : 'bg-color-expense-bg'
                      }`}
                    >
                      <span
                        className={`material-symbols-rounded text-lg ${
                          t.type === 'pemasukan' ? 'text-color-income' : 'text-color-expense'
                        }`}
                      >
                        {getTransactionIcon(t.type, t.name)}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-on-surface truncate">
                        {t.name}
                      </span>
                      {t.note && (
                        <span className="text-xs text-color-text-secondary truncate">
                          {t.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <span
                      className={`text-sm font-bold ${
                        t.type === 'pemasukan' ? 'text-color-income' : 'text-color-expense'
                      }`}
                    >
                      {t.type === 'pemasukan' ? '+' : '-'}{formatRupiah(t.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="ml-1 text-color-expense hover:text-color-expense/70 transition-colors p-1"
                    >
                      <span className="material-symbols-rounded text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {/* Load More Button */}
      {!showAll && filteredTransactions.length > 20 && (
        <div className="flex justify-center pt-md pb-lg">
          <button
            onClick={() => setShowAll(true)}
            className="bg-surface-variant text-on-surface-variant text-base font-bold py-sm px-lg rounded-full min-h-[52px] border border-outline-variant hover:bg-surface-dim transition-colors shadow-sm"
          >
            Tampilkan Lebih Banyak
          </button>
        </div>
      )}
    </div>
  )
}
