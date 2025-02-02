import { Icon } from '@iconify/react';
import type React from "react";
import { useEffect, useState } from "react";
import MerchCard from "./Merch/MerchCard";

interface TShirt {
  id: number;
  name: string;
  image: string[];
  price: number;
}

export const Merch: React.FC = () => {
  const [merchData, setMerchData] = useState<TShirt[]>([]);

  const targetDate = new Date("2025-02-05T12:00:00");
  const calculateTimeLeft = () => {
    const currentTime = new Date().getTime();
    const difference = targetDate.getTime() - currentTime;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("./merch.json");
        const data = await response.json();
        setMerchData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#D4F3D9] text-card-overlay-background">
      <header className="py-6 px-4 bg-card-overlay-background text-[#D4F3D9] text-center">
        <h1 className="text-4xl font-bold">Unlock Your Mind Merch</h1>
      </header>



      <main className="container mx-auto py-12 px-4">
      {/* Countdown Timer Section */}
      <section className="text-center my-6">
      <div className="flex justify-center">
        <div className="flex justify-center items-center rounded-full bg-white p-6 w-3/4 md:w-1/2 lg:w-1/3">
          <Icon icon="mdi:stopwatch" className="text-3xl text-gray-800" />
          <p className="text-lg text-center text-gray-800">
            Sale ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
        </div>
      </div>

      </section>
        {merchData.length > 0 ? (
          merchData.map((shirt) => (
            <MerchCard key={shirt.id} name={shirt.name} price={shirt.price} image={shirt.image} />
          ))
        ) : (
          <div>Loading...</div>
        )}
      </main>
    </div>
  );
};
