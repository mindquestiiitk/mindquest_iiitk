import SaleTicker from '@/SaleTicker';
import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MerchCard from "./Merch/MerchCard";

interface TShirt {
  id: number;
  name: string;
  image: string[];
  price: number;
}

interface SaleData {
  endDate: string;
  tickerText: string;
}

export const Merch: React.FC = () => {
  const navigate = useNavigate();
  const [merchData, setMerchData] = useState<TShirt[]>([]);
  const [saleData, setSaleData] = useState<SaleData | null>(null);
  const [cartData, setCartData] = useState<{ tshirts: { name: string; qty: number; size: string }[] }>({ tshirts: [] });

  const updateCartData = (newItem: { name: string; qty: number; size: string }) => {
    setCartData((prevCart) => ({
      tshirts: [...prevCart.tshirts, newItem],
    }));
    console.log(cartData);
  };

  const calculateTimeLeft = (targetDate: Date) => {
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

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("./merch.json");
        const data = await response.json();
        
        setMerchData(data.products);
        if (data.sale) {
          setSaleData(data.sale);
          setTimeLeft(calculateTimeLeft(new Date(data.sale.endDate)));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (saleData) {
      const interval = setInterval(() => {
        setTimeLeft(calculateTimeLeft(new Date(saleData.endDate)));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [saleData]);

  return (
    <div className="min-h-screen bg-[#D4F3D9] text-card-overlay-background">
      {/* <header className="py-6 px-4 bg-card-overlay-background text-[#D4F3D9] text-center">
        <h1 className="text-4xl font-bold">Unlock Your Mind Merch</h1>
      </header> */}

      <SaleTicker />

      <main className="container mx-auto px-4">
        {/* Countdown Timer Section */}
        {saleData && (
          <section className="text-center my-6">
            <div className="flex justify-center">
              <div className="flex justify-center items-center rounded-full bg-white p-6 w-3/4 md:w-1/2 lg:w-1/3">
                <Icon icon="mdi:stopwatch" className="text-3xl text-gray-800" />
                <p className="text-lg font-bold md:text-3xl text-center text-gray-800">
                  Sale ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </p>
              </div>
            </div>
          </section>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-3 mt-3">
          {merchData.length > 0 ? (
            merchData.map((shirt) => (
              <MerchCard key={shirt.id} name={shirt.name} price={shirt.price} image={shirt.image} updateCartData={updateCartData} />
            ))
          ) : (
            <div className="text-center text-xl">Loading...</div>
          )}
        </div>
      </main>
    </div>
  );
};
