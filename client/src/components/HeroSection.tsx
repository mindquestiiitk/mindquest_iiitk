import { hero_avatar } from "../assets";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { Avatar } from "./Avatar";

const HeroSection = () => {
  const { user } = useFirebaseAuth();

  const scrollSlowly = () => {
    window.scrollTo({
      top: 770,
      behavior: 'smooth',
    });
  };
  return (
    <section
      id="about-us"
      className="flex flex-col justify-between items-center md:flex-row gap-10 w-full max-container"
    >
      <div className="flex flex-1 justify-center items-center md:order-2">
        {user ? (
          <div className="flex flex-col items-center">
            <Avatar
              size="xl"
              showStatus={false}
              className="w-[200px] h-[200px] md:w-[240px] md:h-[240px] lg:w-[300px] lg:h-[300px]"
            />
            <p className="mt-4 text-center text-light-green font-medium">
              Welcome back, <span className="font-bold">{user.name}</span>!
            </p>
          </div>
        ) : (
          <img
            src={hero_avatar}
            alt="hero avatar"
            className="object-contain rounded-xl w-[200px] md:w-[240px] lg:w-[500px]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col xl:mx-12 md:order-1">
        <div className="flex flex-col my-4">
          <h2 className="font-acme text-4xl text-center capitalize text-light-green md:text-5xl lg:max-w-lg lg:text-left lg:text-6xl">
            <span>Unlock Your Mind </span>
            <span className="text-coral-red "> Begin Your Quest </span>
          </h2>
          <p className="mt-6 lg:max-w-lg info-text font-roboto text-xl text-light-green text-center lg:text-left">
            Discover a space dedicated to nurturing your mental health. Join us
            as we explore resources, support, and community
          </p>
          <div className="mt-2 mx-auto lg:mx-0">
            <button
              className={`px-6 py-2 my-2 bg-primary-green text-secondary-green font-bold rounded-lg`}
              onClick={scrollSlowly}
            >
              Explore
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
