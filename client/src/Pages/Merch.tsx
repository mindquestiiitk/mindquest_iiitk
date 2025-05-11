import React, { useEffect, useState, lazy, Suspense } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const SaleTicker = lazy(() => import("../components/SaleTicker"));
const MerchCard = lazy(() => import("./Merch/MerchCard"));

interface Product {
  id: string;
  name: string;
  material: string;
  image: string[];
  price: number;
  discounted_price: number;
}

interface SaleData {
  endDate: string;
  tickerText: string;
}

export const Merch: React.FC = () => {
  const [merchData, setMerchData] = useState<Product[]>([]);
  const [saleData, setSaleData] = useState<SaleData | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeLeft = (targetDate: Date) => {
    const currentTime = new Date().getTime();
    const difference = targetDate.getTime() - currentTime;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔄 Fetching merch and sale data...");

        // Fetch products from backend API
        const productsResponse = await fetch(
          import.meta.env.VITE_API_URL + "/merch/products"
        );
        const products = await productsResponse.json();

        // Fetch sale details from backend API
        const saleResponse = await fetch(
          import.meta.env.VITE_API_URL + "/merch/sales"
        );

        const sale = await saleResponse.json();

        setMerchData(products);

        if (sale) {
          setSaleData({
            endDate: sale.end_date,
            tickerText: sale.ticker_text,
          });
          setTimeLeft(calculateTimeLeft(new Date(sale.end_date)));
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
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
      <Suspense
        fallback={
          <div className="text-center text-xl">Loading Sale Ticker...</div>
        }
      >
        <SaleTicker />
      </Suspense>

      <main className="container mx-auto px-4">
        {saleData && (
          <section className="text-center my-6">
            <div className="flex justify-center">
              <div className="flex justify-center items-center rounded-full bg-white p-6 w-3/4 md:w-1/2 lg:w-1/3">
                <Icon icon="mdi:stopwatch" className="text-3xl text-gray-800" />
                <p className="text-lg font-bold md:text-xl text-center text-gray-800">
                  Sale ends in: {timeLeft.days}d {timeLeft.hours}h{" "}
                  {timeLeft.minutes}m {timeLeft.seconds}s
                </p>
              </div>
            </div>
          </section>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-3 mt-3">
          {merchData.length > 0 ? (
            <Suspense
              fallback={
                <div className="text-center text-xl">Loading Merch...</div>
              }
            >
              {merchData.map((shirt) => (
                <MerchCard
                  key={shirt.id}
                  name={shirt.name}
                  price={shirt.price}
                  image={shirt.image}
                  material={shirt.material}
                  discounted_price={shirt.discounted_price}
                />
              ))}
            </Suspense>
          ) : (
            <div className="text-center text-xl">Loading...</div>
          )}
        </div>
      </main>
    </div>
  );
};
