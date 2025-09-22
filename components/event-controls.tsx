"use client"

interface EventControlsProps {
  currentIndex: number
  totalEvents: number
  isPaused: boolean
  animationKey: number
  rotationInterval: number
  onNext: () => void
  onPrevious: () => void
  onTogglePause: () => void
  onGoToEvent: (index: number) => void
}

export function EventControls({
  currentIndex,
  totalEvents,
  isPaused,
  animationKey,
  rotationInterval,
  onNext,
  onPrevious,
  onTogglePause,
  onGoToEvent,
}: EventControlsProps) {
  if (totalEvents <= 1) return null

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center">
      <div className="flex gap-3">
        {Array.from({ length: totalEvents }, (_, index) => (
          <button
            key={index}
            onClick={() => onGoToEvent(index)}
            className="relative w-4 h-4 rounded-full transition-all duration-300 hover:scale-110"
            onMouseEnter={index === currentIndex ? onTogglePause : undefined}
            onMouseLeave={index === currentIndex ? onTogglePause : undefined}
          >
            {index === currentIndex ? (
              <div className="relative w-4 h-4">
                <svg className="w-4 h-4 -rotate-90" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <mask id={`progress-mask-${index}-${animationKey}`}>
                      <rect width="16" height="16" fill="#888" />
                      <circle
                        cx="8"
                        cy="8"
                        r="8"
                        fill="none"
                        stroke="white"
                        strokeWidth="16"
                        strokeDasharray="50.3"
                        strokeDashoffset="50.3"
                        className="animate-svg-progress"
                        style={{
                          animationDuration: `${rotationInterval}ms`,
                          animationPlayState: isPaused ? "paused" : "running",
                          animationTimingFunction: "linear",
                        }}
                      />
                    </mask>
                  </defs>
                  <circle cx="8" cy="8" r="8" fill="#ccc" />
                  <circle cx="8" cy="8" r="8" fill="#888" mask={`url(#progress-mask-${index}-${animationKey})`} />
                </svg>
              </div>
            ) : (
              <div className="w-4 h-4 bg-muted-foreground/30 hover:bg-muted-foreground/50 rounded-full transition-colors" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
