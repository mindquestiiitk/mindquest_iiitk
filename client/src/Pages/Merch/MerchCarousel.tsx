import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";

interface MerchCarouselProps {
  images: string[];
}

export const MerchCarousel: React.FC<MerchCarouselProps> = (props) => {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  )
  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full max-w-2xl"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {props.images.length > 0 && props.images.slice(0, 2).map((image, index) => (
          
          <CarouselItem key={index}>
            <div className="p-1">
             
              <Card className="outline-none border-none">
                <Badge variant="outline" className="m-0 p-0 bg-emerald-100/50 text-emerald-800">
                  ⚡ Limited Stock
                </Badge>
                <CardContent className="w-full flex items-center justify-center p-0 overflow-hidden rounded-2xl">
                  <img src={image} alt={`Merch item ${index}`} className=" w-full rounded-2xl scale-125 translate-y-5" />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="translate-x-3/4"/>
  <CarouselNext className="-translate-x-3/4" />
    </Carousel>
  )
}
