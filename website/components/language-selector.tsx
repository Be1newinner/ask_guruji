"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLanguageStore } from "@/lib/store" // Fixed import - should be from store, not translations
import { useTranslation } from "@/lib/translations"
import { Languages } from "lucide-react"

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentLanguage, setLanguage } = useLanguageStore()
  const { t } = useTranslation()

  const languages = [
    { code: "hindi" as const, name: "हिंदी", flag: "🇮🇳" },
    { code: "english" as const, name: "English", flag: "🇺🇸" },
    { code: "hinglish" as const, name: "Hinglish", flag: "🇮🇳🇺🇸" },
  ]

  const handleLanguageChange = (languageCode: "hindi" | "english" | "hinglish") => {
    setLanguage(languageCode)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Languages className="h-4 w-4 mr-2" />
          {t("Language")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Select Language")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant={currentLanguage === language.code ? "default" : "outline"}
              className="w-full justify-start text-left"
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className="mr-3 text-lg">{language.flag}</span>
              <span>{language.name}</span>
              {currentLanguage === language.code && <span className="ml-auto text-xs">✓</span>}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
