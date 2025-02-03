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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MerchCarousel } from "./MerchCarousel";

interface MerchCardProps {
  name: string;
  price: number;
  image: string[];
  key: string | number;
  qty: number;
}

const MerchCard: React.FC<MerchCardProps> = (props) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    const checkIsMobile = () => window.innerWidth <= 768;
    const handleResize = () => setIsMobile(checkIsMobile());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    window.location.href = 'https://forms.gle/diMb5u6T5iQAabJt6';
  };

  return (
    <Card className={`w-full mx-auto shadow-2xl border-2 border-emerald-100/50 rounded-[2rem] bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-3xl transition-all duration-500 ease-out hover:border-emerald-200/50 ${
      isMobile 
        ? 'max-w-full md:max-w-[95%] p-4 md:p-6 mb-2'
        : 'max-w-[90%] md:max-w-[85%] p-6 md:p-10 mb-10'
    }`}>
      <div className={`flex ${isMobile ? 'flex-col gap-1 md:gap-4' : 'flex-col lg:flex-row gap-8 md:gap-12'}`}>
        
        {/* Media Section */}
        <div className={`${isMobile ? 'w-[80%] lg:w-full' : 'w-full lg:w-[65%]'} mx-auto`}>
          <MerchCarousel images={props.image} />
          {!isMobile && (
            <div className="mt-6 flex gap-4 items-center justify-center">
              <Icon icon="mdi:leaf" className="w-6 h-6 text-emerald-600" />
              <span className="text-sm font-medium text-gray-600">Eco-Friendly</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full flex flex-col justify">
          {isMobile ? (
            <Drawer>
              <DrawerTrigger>
                <CardHeader className="px-0 pt-0 mb-0 p-0">
                  <div className="mb-4">
                    <CardTitle className="text-2xl md:text-xl font-bold text-primary-green">
                      {props.name}
                    </CardTitle>
                    <CardDescription className="text-xs md:text-lg text-gray-500 font-medium">
                      Organic Cotton Premium Fit
                    </CardDescription>
                  </div>
                </CardHeader>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="text-3xl font-bold text-primary-green">
                    {props.name}
                  </DrawerTitle>
                  <DrawerDescription>
                    <div className="flex flex-col gap-4">
                      <div className="mx-auto">
                        <Label className="text-lg font-semibold text-gray-900">
                          Sizes 🌐
                        </Label>
                        <div className="flex space-x-4 mx-auto">
                          {sizeOptions.map((size) => (
                            <span key={size} className="text-base">
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-primary-green">
                        ₹{props.price}
                      </div>
                    </div>
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button onClick={handleAddToCart} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-100/50">
                    Continue to Forms
                  </Button>
                  <DrawerClose>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            <>
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
                <div className="grid w-full gap-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-900">
                      Sizes 🌐
                    </Label>
                    <div className="flex space-x-4">
                      {sizeOptions.map((size) => (
                        <span key={size} className="text-base">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-primary-green">
                      ₹{props.price}
                    </div>
                    <p className="text-sm text-gray-500">Inclusive of all taxes</p>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Add to Cart Button */}
          {!isMobile && (
            <div className="space-y-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <Button
                  className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-100/50"
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
          )}
        </div>
      </div>
    </Card>
  );
};

export default MerchCard;