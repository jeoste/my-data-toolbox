import { Lock, Zap, FileText, CheckCircle, Search, Info, User, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViewType } from '@/App'
import logoPng from '../../assets/json-tools-logo.jpg'
import { cn } from 'src/lib/utils'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { LanguageSelector } from '@/components/language-selector'
import { ThemeSelector } from '@/components/theme-selector'
import { useTranslation } from 'react-i18next'
import { useUpdater } from '@/hooks/use-updater'

interface LayoutProps {
  children: React.ReactNode
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { t } = useTranslation()
  const { isCheckingForUpdates, updateStatus, appVersion, checkForUpdates } = useUpdater()
  
  const navigationItems = [
    {
      key: 'anonymize' as ViewType,
      label: t('layout.navigation.anonymize'),
      icon: Lock,
    },
    {
      key: 'generate' as ViewType,
      label: t('layout.navigation.generate'),
      icon: Zap,
    },
    {
      key: 'swagger' as ViewType,
      label: t('layout.navigation.swagger'),
      icon: FileText,
    },
    {
      key: 'swaggerToJson' as ViewType,
      label: t('layout.navigation.swaggerToJson'),
      icon: FileText,
    },
    {
      key: 'validator' as ViewType,
      label: t('layout.navigation.validator'),
      icon: CheckCircle,
    },
    {
      key: 'jsonpath' as ViewType,
      label: t('layout.navigation.jsonpath'),
      icon: Search,
    },
  ]

  const viewDescriptions: Record<ViewType, string> = {
    anonymize: t('layout.descriptions.anonymize'),
    generate: t('layout.descriptions.generate'),
    swagger: t('layout.descriptions.swagger'),
    swaggerToJson: t('layout.descriptions.swaggerToJson'),
    validator: t('layout.descriptions.validator'),
    jsonpath: t('layout.descriptions.jsonpath'),
  }

  const getViewTitle = (view: ViewType) => {
    const item = navigationItems.find(item => item.key === view)
    return item?.label || t('layout.appName')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <img
              src={logoPng}
              alt="JSON Tools logo"
              className="w-8 h-8 rounded-md object-cover"
            />
            <h1 className="text-xl font-medium">{t('layout.appName')}</h1>
          </div>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.key}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-normal",
                    currentView === item.key
                      ? "border-l-4 border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  )}
                  onClick={() => onViewChange(item.key)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          {/* Sélecteurs de langue et thème */}
          <div className="mt-6 space-y-2">
            <LanguageSelector />
            <ThemeSelector />
          </div>
        </div>

        {/* Account & About section */}
        <div className="border-t border-border pt-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start font-normal text-muted-foreground hover:text-foreground"
              >
                <User className="w-4 h-4 mr-2" />
                {t('layout.account.title')}
              </Button>
            </SheetTrigger>
          <SheetContent side="bottom" className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>{t('layout.account.title')}</SheetTitle>
              <SheetDescription>
                {t('layout.account.description')}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <p>{t('layout.account.featureInDevelopment')}</p>
            </div>
          </SheetContent>
        </Sheet>

          {/* About section */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start font-normal text-muted-foreground hover:text-foreground"
              >
                <Info className="w-4 h-4 mr-2" />
                {t('layout.about.title')}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>{t('layout.about.title')}</SheetTitle>
                <SheetDescription>
                  {t('layout.about.version', { version: appVersion })}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <p>{t('layout.about.contact')} <a href="mailto:contact@neungbo.com" className="underline text-primary">contact@neungbo.com</a>.</p>
                
                {/* Update Status */}
                {updateStatus && updateStatus.message && (
                  <div className={cn(
                    "p-3 rounded-md border text-sm",
                    updateStatus.status === 'error' && "border-destructive/50 bg-destructive/10 text-destructive",
                    updateStatus.status === 'available' && "border-green-500/50 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                    updateStatus.status === 'downloading' && "border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
                    updateStatus.status === 'downloaded' && "border-green-500/50 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                    (updateStatus.status === 'checking' || updateStatus.status === 'not-available') && "border-muted bg-muted/50 text-muted-foreground"
                  )}>
                    <p className="font-medium">
                      {updateStatus.status === 'available' && '🆕 '}
                      {updateStatus.status === 'downloading' && '📥 '}
                      {updateStatus.status === 'downloaded' && '✅ '}
                      {updateStatus.status === 'error' && '❌ '}
                      {updateStatus.status === 'checking' && '🔍 '}
                      {updateStatus.message}
                    </p>
                    {updateStatus.status === 'downloading' && updateStatus.percent && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${updateStatus.percent}%` }}
                          ></div>
                        </div>
                        <p className="text-xs mt-1 opacity-70">{Math.round(updateStatus.percent || 0)}%</p>
                      </div>
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={checkForUpdates}
                  disabled={isCheckingForUpdates}
                  className="w-full"
                  variant={updateStatus?.status === 'available' ? 'default' : 'outline'}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isCheckingForUpdates ? t('layout.about.checkingUpdates') : t('layout.about.checkUpdates')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col gap-1 px-6 py-3">
            <h2 className="text-lg font-medium">
              {getViewTitle(currentView)}
            </h2>
            <p className="text-sm leading-relaxed text-foreground/80">
              {viewDescriptions[currentView]}
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
} 