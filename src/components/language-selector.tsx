
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
] as const

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? i18n.language

  const handleChange = (value: string) => {
    if (value !== current) {
      i18n.changeLanguage(value)
    }
  }

  const currentLang = languages.find(l => l.code === current) ?? languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start font-normal text-muted-foreground hover:text-foreground">
          <span className="text-lg mr-2">{currentLang.flag}</span>
          {currentLang.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={current} onValueChange={handleChange}>
          {languages.map(lang => (
            <DropdownMenuRadioItem key={lang.code} value={lang.code}>
              <span className="text-lg mr-2">{lang.flag}</span>
              {lang.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 