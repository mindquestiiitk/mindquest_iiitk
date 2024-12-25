import Navbar_Home from '../components/Navbar/Navbar_Home'
import HeroSection from '../components/HeroSection'
import FAQ from '../components/FAQ'

const Home = () => {
  return (
    <div>
      <Navbar_Home />
      <section className='sm:px-16 px-8 sm:py-24 py-12'>
        <HeroSection />
      </section>
      Home Page
      <FAQ />
    </div>
  )
}

export default Home
