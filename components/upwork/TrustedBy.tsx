import { Award, Star, ThumbsUp, CheckCircle, Zap, Target, Trophy } from "lucide-react"

const badges = [
  {
    icon: Award,
    title: "BEST PROPTECH 2026",
    subtitle: "Top 50 Innovators",
  },
  {
    icon: Star,
    title: "WINTER 2026",
    subtitle: "Leader HOME SERVICES",
  },
  {
    icon: ThumbsUp,
    title: "WINTER 2026",
    subtitle: "Best ROI TRADIE PLATFORM",
  },
  {
    icon: CheckCircle,
    title: "WINTER 2026",
    subtitle: "Easiest To Use APP",
  },
  {
    icon: Zap,
    title: "WINTER 2026",
    subtitle: "Fastest Dispatch TIMES",
  },
  {
    icon: Target,
    title: "WINTER 2026",
    subtitle: "Most Accurate AI QUOTES",
  },
  {
    icon: Trophy,
    title: "WINTER 2026",
    subtitle: "Best Agency MANAGEMENT",
  },
]

export function TrustedBy() {
  return (
    <section className="py-16 lg:py-24 bg-(--upwork-light-gray)">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-(--upwork-navy) text-center mb-12">
          Trusted by home owners & local businesses
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 bg-white rounded-xl"
              >
                <div className="w-12 h-12 rounded-lg bg-(--upwork-green)/10 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-(--upwork-green)" />
                </div>
                <p className="text-xs font-bold text-(--upwork-navy) mb-1">
                  {badge.title}
                </p>
                <p className="text-xs text-(--upwork-gray)">
                  {badge.subtitle}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
