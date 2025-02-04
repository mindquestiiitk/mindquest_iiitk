import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


import { Label } from "@/components/ui/label";
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { MerchCarousel } from "./MerchCarousel";

// Define the interface for props
interface MerchCardProps {
  name: string;
  price: number;
  image: string[];
  key: string | number; // Assuming key is passed down from a parent component
  qty: number; // Assuming key is passed down from a parent component
}

const MerchCard: React.FC<MerchCardProps> = (props) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAddToCart = (e:any) => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    e.preventDefault();
    // if (!selectedSize) return alert("Please select a size");

    // props.updateCartData({ name: props.name, qty: quantity, size: selectedSize });

    // alert("Item added to cart!");
    window.location.href = 'https://www.google.com';
  };
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <Card className="w-full max-w-[90%] md:max-w-[85%] mx-auto p-6 md:p-10 shadow-2xl border-2 border-emerald-100/50 rounded-[2rem] bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-3xl transition-all duration-500 ease-out hover:border-emerald-200/50 mb-10">
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
          <form>
                <div className="grid w-full gap-8">
                  {/* Size Selector with Chart */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-lg font-semibold text-gray-900">
                        Sizes 🌐
                      </Label>
                    </div>
                    {/* <Select onValueChange={setSelectedSize} value={selectedSize}>
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
                    </Select> */}
                    <div className="flex space-x-4"> {/* Add flex to align items in a row */}
                        {sizeOptions.map((size) => (
                          <p
                            key={size} // It's important to keep the key prop to ensure each element is uniquely identified in the list
                            className="text-base data-[state=checked]:bg-emerald-50"
                          >
                            {size}
                          </p>
                        ))}
                      </div>
                      <br></br>

                  </div>

                  {/* Quantity Selector */}
                  {/* <div className="space-y-4">
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
                  </div> */}

                </div>
              </form>
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
      <Button
        className="w-full lg:w-[100%] h-14 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-100/50"
        onClick={handleAddToCart}
      >
        <span className={`mr-2 ${isAnimating ? 'animate-spin' : ''}`}>
          🛒
        </span>
        Continue to Forms
      </Button>
    
    {isAnimating && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 2, opacity: 0 }}
        className="absolute inset-0 rounded-full bg-emerald-100/50"
      />
    )}
  </motion.div>
</div>
        </div>
      </div>
    </Card>
  );
};

export default MerchCard;
