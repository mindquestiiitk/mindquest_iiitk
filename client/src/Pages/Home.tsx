import Navbar_Home from '../components/Navbar/Navbar_Home'
import HeroSection from '../components/HeroSection'
import FAQ from '../components/FAQ'
import { ChatInterface, MoodSection, TeamSection, KeyFeatures  } from '../components/HomePageSecions'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div>
      <Navbar_Home />
      <section className='sm:px-16 px-8 sm:py-24 py-12'>
        <HeroSection />
      </section>
      <ChatInterface />
      <KeyFeatures />
      <TeamSection />
      <MoodSection />
      <FAQ />
      <Footer />
    </div>
  )
}

export default Home
