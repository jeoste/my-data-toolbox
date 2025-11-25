import { Lock, Zap, FileText, CheckCircle, Search, ChevronDown, ChevronRight, Code2, FileCode, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViewType } from '@/App'
import logoPng from '@/assets/logo.png'
import { cn } from '@/lib/utils'
import { LanguageSelector } from '@/components/language-selector'
import { ThemeSelector } from '@/components/theme-selector'
import { useTranslation } from 'react-i18next'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

interface NavigationItem {
  key: ViewType
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavigationCategory {
  category: string
  icon: React.ComponentType<{ className?: string }>
  tools: NavigationItem[]
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { t } = useTranslation()
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    JSON: true,
    XML: true,
  })

  const allTools: Record<ViewType, NavigationItem> = {
    anonymize: {
      key: 'anonymize' as ViewType,
      label: t('layout.navigation.anonymize'),
      icon: Lock,
    },
    generate: {
      key: 'generate' as ViewType,
      label: t('layout.navigation.generate'),
      icon: Zap,
    },
    swagger: {
      key: 'swagger' as ViewType,
      label: t('layout.navigation.swagger'),
      icon: FileText,
    },
    swaggerToJson: {
      key: 'swaggerToJson' as ViewType,
      label: t('layout.navigation.swaggerToJson'),
      icon: FileText,
    },
    validator: {
      key: 'validator' as ViewType,
      label: t('layout.navigation.validator'),
      icon: CheckCircle,
    },
    jsonpath: {
      key: 'jsonpath' as ViewType,
      label: t('layout.navigation.jsonpath'),
      icon: Search,
    },
    xmlValidate: {
      key: 'xmlValidate' as ViewType,
      label: t('layout.navigation.xmlValidate'),
      icon: CheckCircle,
    },
    xmlPath: {
      key: 'xmlPath' as ViewType,
      label: t('layout.navigation.xmlPath'),
      icon: Search,
    },
    generateXml: {
      key: 'generateXml' as ViewType,
      label: t('layout.navigation.generateXml'),
      icon: Zap,
    },
    randomJson: {
      key: 'randomJson' as ViewType,
      label: t('layout.navigation.randomJson'),
      icon: Shuffle,
    },
    randomXml: {
      key: 'randomXml' as ViewType,
      label: t('layout.navigation.randomXml'),
      icon: Shuffle,
    },
  }

  const navigationCategories: NavigationCategory[] = [
    {
      category: 'JSON',
      icon: Code2,
      tools: [
        allTools.generate,
        allTools.randomJson,
        allTools.anonymize,
        allTools.validator,
        allTools.jsonpath,
        allTools.swagger,
        allTools.swaggerToJson,
      ],
    },
    {
      category: 'XML',
      icon: FileCode,
      tools: [
        allTools.generateXml,
        allTools.randomXml,
        allTools.xmlValidate,
        allTools.xmlPath,
      ],
    },
  ]

  const viewDescriptions: Record<ViewType, string> = {
    anonymize: t('layout.descriptions.anonymize'),
    generate: t('layout.descriptions.generate'),
    swagger: t('layout.descriptions.swagger'),
    swaggerToJson: t('layout.descriptions.swaggerToJson'),
    validator: t('layout.descriptions.validator'),
    jsonpath: t('layout.descriptions.jsonpath'),
    xmlValidate: t('layout.descriptions.xmlValidate'),
    xmlPath: t('layout.descriptions.xmlPath'),
    generateXml: t('layout.descriptions.generateXml'),
    randomJson: t('layout.descriptions.randomJson'),
    randomXml: t('layout.descriptions.randomXml'),
  }

  const getViewTitle = (view: ViewType) => {
    return allTools[view]?.label || t('layout.appName')
  }

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }))
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
          
          <nav className="space-y-1">
            {navigationCategories.map((category) => {
              const CategoryIcon = category.icon
              const isOpen = openCategories[category.category]
              return (
                <Collapsible
                  key={category.category}
                  open={isOpen}
                  onOpenChange={() => toggleCategory(category.category)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between font-semibold text-sm text-foreground hover:bg-accent"
                    >
                      <div className="flex items-center">
                        <CategoryIcon className="w-4 h-4 mr-2" />
                        {category.category}
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-4">
                    {category.tools.map((tool) => {
                      const ToolIcon = tool.icon
                      return (
                        <Button
                          key={tool.key}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start font-normal",
                            currentView === tool.key
                              ? "border-l-4 border-primary bg-primary/10 text-primary"
                              : "text-muted-foreground"
                          )}
                          onClick={() => onViewChange(tool.key)}
                        >
                          <ToolIcon className="w-4 h-4 mr-2" />
                          {tool.label}
                        </Button>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </nav>

          {/* Sélecteurs de langue et thème */}
          <div className="mt-6 space-y-2">
            <LanguageSelector />
            <ThemeSelector />
          </div>
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