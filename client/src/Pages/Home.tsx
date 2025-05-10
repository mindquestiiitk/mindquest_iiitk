import HeroSection from '../components/HeroSection'
import FAQ from '../components/FAQ'
import KeyFeatures from '@/components/KeyFeatures'
import Team from '../components/Team'
import Timeline from '@/components/Timeline'

const Home = () => {
    return (
        <>
            <section className='sm:px-16 px-8 sm:py-24 py-12'>
                <HeroSection />
            </section>
            <KeyFeatures />
            <Timeline />
            <Team />
            <FAQ />
        </>
    )
}

export default Home
