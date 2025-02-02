import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { MerchCarousel } from "./MerchCarousel";
import MerchForm from "./MerchForm";

// Define the interface for props
interface MerchCardProps {
  name: string;
  price: number;
  image: string[];
  key: string | number; // Assuming key is passed down from a parent component
}

const MerchCard: React.FC<MerchCardProps> = (props) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isForm, setIsForm] = useState(false);

  const handleAddToCart = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    setIsForm(() => true);
  };

  return (
    <Card key={props.key} className="w-full max-w-[90%] md:max-w-[85%] mx-auto p-6 md:p-10 shadow-2xl border-2 border-emerald-100/50 rounded-[2rem] bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-3xl transition-all duration-500 ease-out hover:border-emerald-200/50 mb-10">
      <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
        {/* Media Section */}
        <div className="w-full lg:w-[65%] ">
          <MerchCarousel images={props.image} />
          <div className="mt-6 flex gap-4 items-center justify-center">
            <Icon icon="mdi:leaf" className="w-6 h-6 text-emerald-600" />
            <span className="text-sm font-medium text-gray-600">Eco-Friendly</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full lg: flex flex-col justify">
          <CardHeader className="px-0 pt-0">
            <div className="mb-4">
              <Badge variant="outline" className="mb-3 bg-emerald-100/50 text-emerald-800">
                ⚡ Limited Stock: 12 Left
              </Badge>
              <CardTitle className="text-4xl md:text-5xl font-bold text-primary-green">
                {props.name}
              </CardTitle>
              <CardDescription className="text-lg md:text-xl text-gray-500 mt-3 font-medium">
                Organic Cotton Premium Fit | UV Protection | Wrinkle-Free
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            {/* Price Section */}
            <div className="space-y-1">
              <div className="flex gap-1">
                <span className="text-4xl font-bold text-primary-green">
                  ₹{props.price}
                </span>
              </div>
              <p className="text-sm text-gray-500">Inclusive of all taxes</p>
            </div>
          </CardContent>

          {/* Actions */}
          <div className="space-y-2"> 
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="relative"
  >
    {!isForm &&
      <Button
        className="w-full lg:w-[80%] h-14 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-100/50"
        onClick={handleAddToCart}
      >
        <span className={`mr-2 ${isAnimating ? 'animate-spin' : ''}`}>
          🛒
        </span>
        Continue to Forms
      </Button>
    }
    {isAnimating && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 2, opacity: 0 }}
        className="absolute inset-0 rounded-full bg-emerald-100/50"
      />
    )}
    {isForm && 
      <MerchForm tshirt={props.name}/>
    }
  </motion.div>
</div>

        </div>
      </div>
    </Card>
  );
};

export default MerchCard;
