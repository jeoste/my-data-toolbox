import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useTheme, type Theme } from '@/components/theme-provider'

export function ThemeSelector() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const isDark = theme === 'dark'
  const Icon = isDark ? Sun : Moon
  const label = isDark ? t('theme.light') : t('theme.dark')

  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start font-normal text-muted-foreground hover:text-foreground"
      onClick={toggleTheme}
      title={t('theme.tooltip')}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Button>
  )
} 