import { Outlet } from 'react-router-dom'
import TopAppBar from './TopAppBar'
import BottomNavBar from './BottomNavBar'

export default function Layout() {
  return (
    <div className="bg-color-background text-color-text-primary antialiased min-h-screen flex flex-col pt-16 pb-[88px]">
      <TopAppBar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <BottomNavBar />
    </div>
  )
}
