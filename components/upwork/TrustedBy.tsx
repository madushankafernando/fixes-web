import { Award, Star, ThumbsUp, CheckCircle, Zap, Target, Trophy } from "lucide-react"

const badges = [
  {
    icon: Award,
    title: "BEST SOFTWARE 2026",
    subtitle: "Top 50 HR PRODUCTS",
  },
  {
    icon: Star,
    title: "WINTER 2026",
    subtitle: "Leader SMALL BUSINESS",
  },
  {
    icon: ThumbsUp,
    title: "WINTER 2026",
    subtitle: "Best Results SMALL BUSINESS",
  },
  {
    icon: CheckCircle,
    title: "WINTER 2026",
    subtitle: "Best Usability SMALL BUSINESS",
  },
  {
    icon: Zap,
    title: "WINTER 2026",
    subtitle: "Easiest Setup MID-MARKET",
  },
  {
    icon: Target,
    title: "WINTER 2026",
    subtitle: "Easiest To Use MID-MARKET",
  },
  {
    icon: Trophy,
    title: "WINTER 2026",
    subtitle: "Best Meets Requirements MID-MARKET",
  },
]

export function TrustedBy() {
  return (
    <section className="py-16 lg:py-24 bg-[var(--upwork-light-gray)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--upwork-navy)] text-center mb-12">
          Trusted by growing businesses
        </h2>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 bg-white rounded-xl"
              >
                <div className="w-12 h-12 rounded-lg bg-[var(--upwork-green)]/10 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-[var(--upwork-green)]" />
                </div>
                <p className="text-xs font-bold text-[var(--upwork-navy)] mb-1">
                  {badge.title}
                </p>
                <p className="text-xs text-[var(--upwork-gray)]">
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
