import { ReactNode } from "react";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";

export const CarouselWrapper = ({ children }: { children: ReactNode[] }) => {
  return (
    <Carousel>
      <CarouselContent>
        {children?.map((child, index) => (
          <CarouselItem
            key={index}
            className="md:basis-1/10 lg:basis-1/3 rounded-lg overflow-hidden"
          >
            {child}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
