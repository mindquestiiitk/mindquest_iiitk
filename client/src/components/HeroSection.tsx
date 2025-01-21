// import Button from "./Button";
import { hero_avatar } from "../assets";

const HeroSection = () => {
  return (
    <section
      id="about-us"
      className="flex justify-between items-center max-lg:flex-col gap-10 w-full max-container"
    >
      <div className="flex flex-1 flex-col xl:mx-12">
        <div className="flex flex-col">
          <h2 className="font-acme text-6xl capitalize lg:max-w-lg text-light-green">
            <span>Unlock Your Mind </span>
            <span className="text-coral-red "> Begin Your Quest </span>
          </h2>
          <p className="mt-6 lg:max-w-lg info-text font-roboto text-xl text-light-green">
            Discover a space dedicated to nurturing your mental health. Join us
            as we explore resources, support, and community
          </p>
          <div className="mt-2">
            <button
              className={`px-6 py-2 my-2 bg-primary-green text-secondary-green font-bold rounded-lg`}
            >
              Explore
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-1 justify-center items-center">
        <img
          src={hero_avatar}
          alt="hero avatar"
          width={420}
          height={500}
          className="object-contain rounded-xl"
        />
      </div>
    </section>
  );
};

export default HeroSection;
