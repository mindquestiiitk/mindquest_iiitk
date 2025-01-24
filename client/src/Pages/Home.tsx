import NavbarHome from '../components/Navbar/Navbar_Home'
import HeroSection from '../components/HeroSection'
import KeyFeatures from '../components/KeyFeatures'
import Team from '../components/Team'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

const Home = () => {
    return (
        <div>
            <div className="h-screen flex flex-col">
                <NavbarHome />
                <section className='flex-1 px-4 flex items-center justify-center'>
                    <HeroSection />
                </section>
            </div>
            <KeyFeatures >
                <div
                    className="bg-lighter-green p-4 rounded-2xl shadow flex flex-col items-center"
                >
                    <h2 className="font-bold mb-2 bg-primary-green rounded-full px-4 py-2 text-center text-secondary-green">
                        Binaural Beats
                    </h2>
                    <p className="text-primary-green text-center p-4 text-sm sm:text-base">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam
                        rerum, error repudiandae earum explicabo sunt cumque natus minus
                        id deserunt velit? Laboriosam, pariatur alias. Ex earum quaerat
                        assumenda tempora ducimus.
                    </p>
                </div>
                <div
                    className="bg-lighter-green p-4 rounded-2xl shadow flex flex-col items-center"
                >
                    <h2 className="font-bold mb-2 bg-primary-green rounded-full px-4 py-2 text-center text-secondary-green">
                        Binaural Beats
                    </h2>
                    <p className="text-primary-green text-center p-4 text-sm sm:text-base">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam
                        rerum, error repudiandae earum explicabo sunt cumque natus minus
                        id deserunt velit? Laboriosam, pariatur alias. Ex earum quaerat
                        assumenda tempora ducimus.
                    </p>
                </div>
            </KeyFeatures>
            <Team />
            <FAQ />
            <Footer />
        </div >
    )
}

export default Home
