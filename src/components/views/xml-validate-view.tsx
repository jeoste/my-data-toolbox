import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Copy, FileText, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { useTranslation } from 'react-i18next'
import { FileUpload, readFileAsText, downloadFile } from '@/components/file-upload'
import { apiClient } from '@/lib/api-client'

export function XmlValidateView() {
  const [xmlInput, setXmlInput] = useState('')
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    error?: {
      code?: number
      message: string
      line?: number
      column?: number
      position?: number
    }
    formatted?: string
    structure?: {
      rootTag: string
      attributes: Record<string, string>
      childCount: number
      hasText: boolean
      childTags: Record<string, number>
    }
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleFileSelect = async (file: File) => {
    try {
      const content = await readFileAsText(file)
      setXmlInput(content)
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message || t('common.copyErrorDescription'), variant: 'destructive' })
    }
  }

  const saveFormattedXml = () => {
    if (!validationResult?.formatted) return
    downloadFile(validationResult.formatted, 'formatted.xml', 'application/xml')
    toast({ title: t('xmlValidate.save'), description: t('xmlValidate.save') + ' OK' })
  }

  const validateXml = async () => {
    if (!xmlInput.trim()) return

    setLoading(true)
    setValidationResult(null)

    try {
      const response = await apiClient.validateXml(xmlInput, { format: true })

      if (response.isValid) {
        setValidationResult({
          isValid: true,
          formatted: response.formatted,
          structure: response.structure,
        })
        toast({
          title: t('xmlValidate.toastValidTitle'),
          description: t('xmlValidate.toastValidDesc'),
        })
      } else {
        setValidationResult({
          isValid: false,
          error: response.error,
        })
        toast({
          title: t('xmlValidate.toastInvalidTitle'),
          description: t('xmlValidate.toastInvalidDesc'),
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      setValidationResult({
        isValid: false,
        error: {
          message: error.message || t('xmlValidate.error.unknown'),
        },
      })
      toast({
        title: t('common.error'),
        description: error.message || t('xmlValidate.error.unknown'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (validationResult?.formatted) {
      try {
        await navigator.clipboard.writeText(validationResult.formatted)
        toast({
          title: t('common.copiedTitle'),
          description: t('common.copiedDescription', { context: 'XML' }),
        })
      } catch (error) {
        toast({
          title: t('common.error'),
          description: t('common.copyErrorDescription'),
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-[1600px]">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Input Panel */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('xmlValidate.inputTitle')}
            </CardTitle>
            <CardDescription>
              {t('xmlValidate.inputDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <Textarea
              placeholder={t('xmlValidate.placeholder')}
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              className="min-h-[400px] font-mono text-sm flex-1"
            />
            <FileUpload
              accept=".xml"
              maxSize={10}
              onFileSelect={handleFileSelect}
            />
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="default" 
                onClick={validateXml} 
                disabled={!xmlInput.trim() || loading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {loading ? t('common.loading') : t('xmlValidate.button.validate')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setXmlInput('')
                  setValidationResult(null)
                }}
              >
                {t('common.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Panel */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult?.isValid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  {t('xmlValidate.result.valid')}
                </>
              ) : validationResult?.error ? (
                <>
                  <XCircle className="w-5 h-5 text-destructive" />
                  {t('xmlValidate.result.invalid')}
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  {t('xmlValidate.result.title')}
                </>
              )}
            </CardTitle>
            <CardDescription>
              {validationResult?.isValid && t('xmlValidate.description.valid')}
              {validationResult?.error && t('xmlValidate.description.invalid')}
              {!validationResult && t('xmlValidate.description.placeholder')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {validationResult?.isValid && (
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Badge variant="secondary" className="text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t('xmlValidate.badge.valid')}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      {t('common.copy')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveFormattedXml}>
                      <Save className="w-4 h-4 mr-2" />
                      {t('xmlValidate.save')}
                    </Button>
                  </div>
                </div>
                {validationResult.structure && (
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                    <p><strong>{t('xmlValidate.structure.rootTag')}:</strong> {validationResult.structure.rootTag}</p>
                    <p><strong>{t('xmlValidate.structure.childCount')}:</strong> {validationResult.structure.childCount}</p>
                    {Object.keys(validationResult.structure.childTags).length > 0 && (
                      <div>
                        <strong>{t('xmlValidate.structure.childTags')}:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {Object.entries(validationResult.structure.childTags).map(([tag, count]) => (
                            <li key={tag}>{tag}: {count}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <pre className="bg-muted p-4 rounded-lg overflow-auto flex-1 text-sm min-h-[600px]">
                  <code>{validationResult.formatted}</code>
                </pre>
              </div>
            )}
            
            {validationResult?.error && (
              <div className="space-y-4">
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  {t('xmlValidate.badge.invalid')}
                </Badge>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive font-medium mb-2">
                    {t('xmlValidate.toastInvalidTitle')}:
                  </p>
                  <p className="text-destructive/90 text-sm font-mono">
                    {validationResult.error.message}
                  </p>
                  {validationResult.error.line && (
                    <p className="text-destructive/70 text-xs mt-2">
                      {t('xmlValidate.error.line')}: {validationResult.error.line}
                      {validationResult.error.column && `, ${t('xmlValidate.error.column')}: ${validationResult.error.column}`}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {!validationResult && (
              <div className="flex items-center justify-center min-h-[600px] text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('xmlValidate.noXml')}</p>
                  <p className="text-sm">{t('xmlValidate.submitToValidate')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

