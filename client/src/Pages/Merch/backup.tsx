import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";


import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

const backup: React.FC<MerchCardProps> = (props) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isForm, setIsForm] = useState(false);

  const handleAddToCart = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    setIsForm(() => true);
  };

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  return (
    <Card key={props.key} className="w-full max-w-[90%] md:max-w-[85%] mx-auto p-6 md:p-10 shadow-2xl border-2 border-emerald-100/50 rounded-[2rem] bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-3xl transition-all duration-500 ease-out hover:border-emerald-200/50 mb-10">
      <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
        {/* Media Section */}
        <div className="w-full lg:w-[55%] relative">
          <MerchCarousel images={props.image} />
          <div className="mt-6 flex gap-4 items-center justify-center">
            <Icon icon="mdi:leaf" className="w-6 h-6 text-emerald-600" />
            <span className="text-sm font-medium text-gray-600">Eco-Friendly</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-[45%] flex flex-col justify-between">
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

          <CardContent className="px-0 space-y-8">
            <form>
              <div className="grid w-full gap-8">
                {/* Size Selector with Chart */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-semibold text-gray-900">
                      Select Size 🌐
                    </Label>
                    <button
                      type="button"
                      className="text-sm font-medium text-primary-green flex items-center gap-1"
                    >
                      <Icon icon="mdi:ruler" className="w-4 h-4" />
                      <Popover>
                        <PopoverTrigger>Size Guide</PopoverTrigger>
                        <PopoverContent ><img className="w-96" src="sizeguide.png" alt="Size Guide" /></PopoverContent>
                      </Popover>
                    </button>
                  </div>
                  <Select onValueChange={setSelectedSize} value={selectedSize}>
                    <SelectTrigger className="h-12 text-base border-2 border-gray-200 hover:border-emerald-200">
                      <SelectValue placeholder="Choose your size" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {sizeOptions.map((size) => (
                        <SelectItem
                          key={size}
                          value={size}
                          className="text-base data-[state=checked]:bg-emerald-50"
                        >
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity Selector */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900">
                    Quantity 📦
                  </Label>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 w-12 rounded-xl text-xl"
                      onClick={(e) => {
                        e.preventDefault();
                        setQuantity(Math.max(1, quantity - 1));
                      }}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                      className="h-12 w-20 text-center text-lg font-medium border-2 border-gray-200 rounded-xl focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                    />
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 w-12 rounded-xl text-xl"
                      onClick={(e) => {
                        e.preventDefault();
                        setQuantity(quantity + 1);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>

              </div>
            </form>

            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-primary-green">
                  ₹{props.price}
                </span>
                {/* <span className="text-xl line-through text-gray-400">₹1,999</span> */}
              </div>
              <p className="text-sm text-gray-500">Inclusive of all taxes</p>
            </div>
          </CardContent>

          {/* Actions */}
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              {!isForm &&
                <Button
                  className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-100/50"
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
                <MerchForm tshirt={props.name} size={selectedSize} quantity={quantity}/>
              }
            </motion.div>

            {/* <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-14 text-lg border-2 hover:border-emerald-300"
              >
                <Icon icon="mdi:share-variant" className="w-6 h-6 mr-2 text-blue-500" />
                Share
              </Button>
            </div> */}

            {/* <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <Icon icon="mdi:credit-card-check" className="w-5 h-5 text-emerald-600" />
                <span>Secure SSL Encryption</span>
                <Icon icon="mdi:truck-delivery" className="w-5 h-5 text-emerald-600" />
                <span>2-Day Delivery</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default backup;
