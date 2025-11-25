import { useState, useEffect } from 'react'
import { FileUpload, readFileAsText } from '@/components/file-upload'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, FileText, Copy, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/api-client'

export function XmlPathView() {
  const [xmlInput, setXmlInput] = useState('')
  const [xpathExpr, setXpathExpr] = useState('//')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultCount, setResultCount] = useState<number>(0)
  const [showInstructions, setShowInstructions] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleFileSelect = async (file: File) => {
    try {
      const content = await readFileAsText(file)
      setXmlInput(content)
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.message || t('xmlPath.toast.errorDesc'),
        variant: 'destructive',
      })
    }
  }

  const evaluatePath = async () => {
    if (!xmlInput.trim() || !xpathExpr.trim()) {
      setResult(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.evaluateXmlPath(xmlInput, xpathExpr, { format: 'json' })
      const formatted = JSON.stringify(response.results, null, 2)
      setResult(formatted)
      setResultCount(response.count)
    } catch (err: any) {
      setResult(null)
      setError(err?.message || t('xmlPath.toast.extractionError'))
      toast({
        title: t('common.error'),
        description: err?.message || t('xmlPath.toast.extractionError'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Évaluation automatique avec délai pour ne pas surcharger
  useEffect(() => {
    if (!xmlInput.trim() || !xpathExpr.trim()) {
      setResult(null)
      setError(null)
      setResultCount(0)
      return
    }

    const timer = setTimeout(() => {
      evaluatePath()
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xmlInput, xpathExpr])

  const copyToClipboard = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      toast({ 
        title: t('common.copiedTitle'), 
        description: t('xmlPath.copyToastDesc') 
      })
    } catch {
      toast({
        title: t('common.error'),
        description: t('common.copyErrorDescription'),
        variant: 'destructive',
      })
    }
  }

  const quickExample = (expression: string, xmlExample?: string) => {
    setXpathExpr(expression)
    if (xmlExample) {
      setXmlInput(xmlExample)
    }
  }

  // Exemple XML pour démonstration
  const exampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user>
    <name>John</name>
    <age>25</age>
    <email>john@example.com</email>
    <active>true</active>
  </user>
  <user>
    <name>Alice</name>
    <age>17</age>
    <email>alice@example.com</email>
    <active>false</active>
  </user>
  <user>
    <name>Bob</name>
    <age>30</age>
    <email>bob@example.com</email>
    <active>true</active>
  </user>
</users>`

  const employeesXml = `<?xml version="1.0" encoding="UTF-8"?>
<employees>
  <employee id="001">
    <name>John Doe</name>
    <department>Engineering</department>
  </employee>
  <employee id="002">
    <name>Jane Smith</name>
    <department>Marketing</department>
  </employee>
  <employee id="003">
    <name>Bob Wilson</name>
    <department>Sales</department>
  </employee>
</employees>`

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Instructions Panel - Collapsible at top */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {t('xmlPath.instructions.title')}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                {showInstructions ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {showInstructions && (
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>{t('xmlPath.instructions.description')}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('xmlPath.instructions.examples')}:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><code className="bg-muted px-1 rounded">//user</code> - {t('xmlPath.instructions.example1')}</li>
                    <li><code className="bg-muted px-1 rounded">//user[@id]</code> - {t('xmlPath.instructions.example2')}</li>
                    <li><code className="bg-muted px-1 rounded">//user/name</code> - {t('xmlPath.instructions.example3')}</li>
                    <li><code className="bg-muted px-1 rounded">//user[@id="001"]</code> - {t('xmlPath.instructions.example4')}</li>
                    <li><code className="bg-muted px-1 rounded">//user[age &gt; 20]</code> - {t('xmlPath.instructions.example5')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('xmlPath.inputTitle')}
              </CardTitle>
              <CardDescription>
                {t('xmlPath.inputDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('xmlPath.xpathLabel')}
                </label>
                <Input
                  placeholder={t('xmlPath.xpathPlaceholder')}
                  value={xpathExpr}
                  onChange={(e) => setXpathExpr(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('xmlPath.xmlLabel')}
                </label>
                <Textarea
                  placeholder={t('xmlPath.xmlPlaceholder')}
                  value={xmlInput}
                  onChange={(e) => setXmlInput(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              <FileUpload
                accept=".xml"
                maxSize={10}
                onFileSelect={handleFileSelect}
              />
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="default" 
                  onClick={evaluatePath} 
                  disabled={!xmlInput.trim() || !xpathExpr.trim() || loading}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? t('common.loading') : t('xmlPath.button.evaluate')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setXmlInput('')
                    setXpathExpr('//')
                    setResult(null)
                    setError(null)
                  }}
                >
                  {t('common.clear')}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickExample('//user', exampleXml)}
                >
                  {t('xmlPath.button.example1')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickExample('//employee', employeesXml)}
                >
                  {t('xmlPath.button.example2')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                {t('xmlPath.resultTitle')}
              </CardTitle>
              <CardDescription>
                {result && (
                  <Badge variant="secondary" className="mt-2">
                    {t('xmlPath.resultCount', { count: resultCount })}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      {t('common.copy')}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-sm">
                    <code>{result}</code>
                  </pre>
                </div>
              )}
              
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive font-medium mb-2">
                    {t('xmlPath.error.title')}:
                  </p>
                  <p className="text-destructive/90 text-sm font-mono">
                    {error}
                  </p>
                </div>
              )}
              
              {!result && !error && (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('xmlPath.noResult')}</p>
                    <p className="text-sm">{t('xmlPath.submitToEvaluate')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

