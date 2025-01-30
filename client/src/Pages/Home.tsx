import HeroSection from '../components/HeroSection'
import KeyFeatures from '../components/KeyFeatures'
import Team from '../components/Team'
import FAQ from '../components/FAQ'


const Home = () => {
  return (
    <>
      <section className='sm:px-16 px-8 sm:py-24 py-12'>
        <HeroSection />
      </section>
      <KeyFeatures />
      <Team />
      <FAQ />
    </>
  )
}

export default Home
