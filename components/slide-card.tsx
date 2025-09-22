"use client"

import type { Slide } from "@/hooks/use-slides"
import { Card } from "@/components/ui/card"

interface SlideCardProps {
  slide: Slide
}

export function SlideCard({ slide }: SlideCardProps) {
  return (
    <div className="fullscreen-display flex items-center justify-center bg-background p-8">
      <Card className="w-full h-full max-w-7xl max-h-full flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full">
          <img
            src={slide.imageUrl || "/placeholder.svg"}
            alt={slide.title}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `/placeholder.svg?height=800&width=1200&query=${encodeURIComponent(slide.title)}`
            }}
          />

          {/* Optional slide title overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-semibold">{slide.title}</h2>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
