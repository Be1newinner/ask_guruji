"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/store"
import { Stars } from "lucide-react"

const horoscopes = {
  Aries: "Today brings new opportunities in your career. Trust your instincts.",
  Taurus: "Financial stability is on the horizon. Stay patient and focused.",
  Gemini: "Communication will be key today. Express yourself clearly.",
  Cancer: "Family relationships need your attention. Show your caring side.",
  Leo: "Your leadership qualities will shine. Take charge of situations.",
  Virgo: "Attention to detail will pay off. Perfect your craft today.",
  Libra: "Balance is essential. Seek harmony in all your relationships.",
  Scorpio: "Deep insights await you. Trust your intuitive powers.",
  Sagittarius: "Adventure calls to you. Embrace new experiences.",
  Capricorn: "Hard work will be rewarded. Stay disciplined and focused.",
  Aquarius: "Innovation is your strength. Think outside the box.",
  Pisces: "Your creativity flows freely. Express your artistic side.",
}

export default function HoroscopeWidget() {
  const { user } = useAuthStore()
  const zodiacSign = user?.zodiacSign || "Aries"
  const horoscope = horoscopes[zodiacSign as keyof typeof horoscopes]

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center space-x-2">
          <Stars className="h-4 w-4 text-purple-600" />
          <span>Daily Horoscope</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Badge variant="secondary" className="text-xs">
          {zodiacSign}
        </Badge>
        <p className="text-xs text-muted-foreground leading-relaxed">{horoscope}</p>
      </CardContent>
    </Card>
  )
}
