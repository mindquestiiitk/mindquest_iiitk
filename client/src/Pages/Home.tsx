import NavbarHome from '../components/Navbar/Navbar_Home'
import HeroSection from '../components/HeroSection'
import KeyFeatures from '../components/KeyFeatures'
import Team from '../components/Team'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

const Home = () => {
    return (
        <div>
            <div className="h-screen">
                <NavbarHome />
                <section className='sm:px-16 px-8 sm:py-24 py-12'>
                    <HeroSection />
                </section>
            </div>
            <KeyFeatures />
            <Team />
            <FAQ />
            <Footer />
        </div>
    )
}

export default Home
