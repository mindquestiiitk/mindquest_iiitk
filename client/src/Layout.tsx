import { Outlet } from 'react-router-dom'
import Navbar_Home from './components/Navbar/Navbar_Home'
import Footer from './components/Footer'

const Layout = () => {
  return (
    <>  
      <div className='relative flex flex-col min-h-screen'>
        <div className="z-30 ">
          <Navbar_Home />
        </div>
        <Outlet />
        <Footer />
      </div>
    </>
  )
}

export default Layout