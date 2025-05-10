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

export const EventCarousel: React.FC<MerchCarouselProps> = (props) => {
    const plugin = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true })
    )

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselPrevious style={{
                zIndex: 50,
                translate: "200%"
            }} />
            <CarouselContent>
                {props.images.length > 0 && props.images.map((image, index) => (
                    <CarouselItem key={index} className="flex items-center justify-center p-0 aspect-square">
                        <img src={image} alt={`Event Photo ${index}`} className="rounded-2xl object-cover" />
                        {/* <div className="p-1">
                            <Card>
                                <CardContent className="flex aspect-square items-center justify-center p-0">
                                </CardContent>
                            </Card>
                        </div> */}
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselNext style={{
                zIndex: 50,
                translate: "-200%"
            }} />
        </Carousel>
    )
}
