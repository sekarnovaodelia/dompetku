// Hitung saldo setiap sumber dana berdasarkan transaksi
export function calculateBalances(fundSources, transactions) {
  const balances = {}

  // Inisialisasi semua sumber dana dengan 0
  fundSources.forEach(fs => {
    balances[fs.id] = 0
  })

  // Hitung dari transaksi
  transactions.forEach(t => {
    if (!t.fund_source_id || !balances.hasOwnProperty(t.fund_source_id)) return
    const amount = Number(t.amount) || 0
    if (t.type === 'pemasukan') {
      balances[t.fund_source_id] += amount
    } else if (t.type === 'pengeluaran') {
      balances[t.fund_source_id] -= amount
    }
  })

  return balances
}

// Format rupiah
export function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num)
}

// Format angka dengan titik separator (1.000.000)
export function formatNumber(value) {
  if (!value) return ''
  return Number(value).toLocaleString('id-ID')
}

// Parse angka dari format titik ke number
export function parseNumber(formatted) {
  return formatted.replace(/\./g, '').replace(/[^0-9]/g, '')
}
