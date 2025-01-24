import React from "react";
import { brain_chat } from "../assets";
import { ArrowUpRight } from "lucide-react";

const KeyFeatures: React.FC = () => {
  return (
    <>
    <div className="max-w-4xl mx-auto p-4 flex flex-col lg:flex-row items-start gap-4">
      {/* Chat Container */}
      <div className="w-full bg-secondary-green rounded-2xl p-4 flex items-center gap-4 flex-grow h-36 sm:h-64 relative group">
        {/* Combined overlay */}
        <div className="absolute inset-0 bg-primary-green/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 cursor-not-allowed">
          <p className="text-secondary-green text-5xl font-acme">Coming Soon</p>
        </div>
        
        {/* Left side with brain icon */}
        <div className="relative bg-primary-green m-0 md:m-6 rounded-2xl w-20 h-20 sm:w-40 sm:h-40 lg:w-56 lg:h-56 flex items-center justify-center flex-shrink-0">
          <img
            src={brain_chat}
            alt="Brain Chat Icon"
            className="w-full h-full object-contain rounded-2xl"
          />
          <span className="absolute text-white text-sm mt-14 sm:mt-32 sm:text-sm lg:text-base mx-28 sm:mx-36 lg:mx-40">
            brain
          </span>
        </div>

        {/* Right side content */}
        <div className="flex-grow flex flex-wrap gap-2">
          <div className="text-green-800 font-medium mb-2 text-lg sm:text-xl lg:text-2xl sm:w-full font-acme">
            Hi,
          </div>
          <div className="text-green-800 font-medium mb-2 text-lg sm:text-xl lg:text-2xl font-acme">
            Steve Jobs
          </div>
          <div className="relative mt-4 sm:mt-16 lg:mt-24 w-full">
            <input
              type="text"
              placeholder="Type Something"
              className="w-full rounded-full bg-green-100/50 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 border-2 border-primary-green"
              disabled
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-green rounded-full p-1">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Rest of the component remains unchanged */}
      <div className="bg-accent rounded-xl p-3 text-center flex items-center justify-center whitespace-nowrap transform cursor-pointer w-full max-w-4xl lg:w-16 h-12 lg:h-64 lg:flex-shrink-0">
        <p className="w-full lg:w-auto px-54 text-accent-foreground flex items-center justify-between flex-row lg:gap-2 lg:-rotate-90 text-xl">
          <div className="">
            Contact Councelor
          </div>
          <div>
            <ArrowUpRight />
          </div>
        </p>
      </div>
    </div>

      {/* Key Features Section */}
      <div className="bg-secondary-green p-6 m-6 rounded-2xl mb-12">
        <h1 className="font-acme text-3xl sm:text-4xl text-primary-green font-medium text-center my-6">
          Key Features
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
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
          ))}
        </div>
      </div>
    </>
  );
};

export default KeyFeatures;