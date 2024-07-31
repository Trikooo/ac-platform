import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"

export default function CategoriesCarousel() {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true
      }}
      buttonPosition={1}
      buttonHover={false}
      className=" w-full"
    >
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className=" basis-1/2 md:basis-1/3 lg:basis-1/4">
              <Card className="transition-all duration-100 hover:shadow-md">
                <CardContent className="flex aspect-square items-center justify-center ">
                  <Image src="/products/image.png" width={200} height={200} alt="category" />
                </CardContent>
              </Card>

          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
