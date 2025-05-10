// import Button from "./Button";
import { hero_avatar } from "../assets";

const HeroSection = () => {
  const scrollSlowly = () => {
    let distance = 0;
    const step = 20; 
    const interval = setInterval(() => {
      if (distance >= 770) {
        clearInterval(interval);
      } else {
        window.scrollBy(0, step);
        distance += step;
      }
    }, 8); 
  };
  return (
    <section
      id="about-us"
      className="flex flex-col justify-between items-center md:flex-row gap-10 w-full max-container"
    >
      <div className="flex flex-1 justify-center items-center md:order-2">
        <img
          src={hero_avatar}
          alt="hero avatar"
          className="object-contain rounded-xl w-[200px] md:w-[240px] lg:w-[500px]"
        />
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
