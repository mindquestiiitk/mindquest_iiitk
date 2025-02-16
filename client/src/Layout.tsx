
import { Outlet } from 'react-router-dom'
import Navbar_Home from './components/Navbar/Navbar_Home'
import Footer from './components/Footer'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

const Layout = () => {
  return (
    <>  
      <Analytics />
      <SpeedInsights />
      <div className='relative flex flex-col min-h-screen'>
        <div className="z-30 w-full pb-2">
          <Navbar_Home />
        </div>
        <Outlet />
        <Footer />
      </div>
    </>
  )
}

export default Layout