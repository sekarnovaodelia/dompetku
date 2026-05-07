# DompetKu

Aplikasi manajemen keuangan pribadi dengan React + Vite + Supabase.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase
1. Buat project di [supabase.com](https://supabase.com)
2. Buka SQL Editor di Supabase Dashboard
3. Copy-paste isi file `supabase_schema.sql` dan jalankan
4. Copy URL dan Anon Key dari Settings > API

### 3. Konfigurasi Environment
```bash
copy .env.example .env
```
Edit `.env` dengan credentials Supabase Anda:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Jalankan Development Server
```bash
npm run dev
```

### 5. Buka di Browser
```
http://localhost:5173
```

## Fitur
- 📊 Dashboard dengan ringkasan keuangan real-time
- 💰 Tambah pemasukan & pengeluaran
- 📝 Riwayat transaksi dengan search & filter
- 🤝 Manajemen piutang
- 🏦 Sumber dana (multi-wallet)
- 🔐 Autentikasi (login/register)
- 📶 Offline-first sync
- 📱 Mobile-first responsive design
