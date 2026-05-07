import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: 'account_balance_wallet', label: 'Transaksi' },
  { to: '/riwayat', icon: 'history', label: 'Riwayat' },
  { to: '/piutang', icon: 'person_search', label: 'Piutang' },
  { to: '/sumber-dana', icon: 'account_balance', label: 'Sumber Dana' },
]

export default function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 h-[88px] bg-white border-t-2 border-slate-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:hidden">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center rounded-xl px-2 py-2 tap-highlight-transparent active:scale-90 transition-all flex-1 min-w-0 ${
              isActive
                ? 'bg-emerald-700 text-white'
                : 'text-slate-500 hover:bg-emerald-50'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-rounded text-2xl"
                style={{
                  fontVariationSettings: isActive
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span
                className={`text-[11px] mt-1 text-center leading-tight w-full whitespace-normal ${
                  isActive ? 'font-bold' : 'font-semibold'
                }`}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
