import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Copy, Loader2, FileText, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/api-client'
import { FileUpload, readFileAsText, downloadFile } from '@/components/file-upload'

export function AnonymizeView() {
  const [jsonInput, setJsonInput] = useState('')
  const [anonymized, setAnonymized] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleAnonymize = async () => {
    setLoading(true)
    try {
      // On valide d'abord le JSON localement pour un retour immédiat
      const data = JSON.parse(jsonInput)

      const response = await apiClient.anonymize(data)

      if (response?.success && response.data) {
        const formatted = JSON.stringify(response.data, null, 2)
        setAnonymized(formatted)
        toast({
          title: t('anonymize.toast.successTitle'),
          description: t('anonymize.toast.successDesc'),
        })
      } else {
        throw new Error('Anonymization failed')
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.message || t('anonymize.toast.errorDesc'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    try {
      const content = await readFileAsText(file)
      const data = JSON.parse(content)
      setJsonInput(content)

      // Auto-anonymize after import
      setLoading(true)
      const response = await apiClient.anonymize(data)

      if (response?.success && response.data) {
        const formatted = JSON.stringify(response.data, null, 2)
        setAnonymized(formatted)
        toast({
          title: t('anonymize.toast.successTitle'),
          description: t('anonymize.toast.successDesc'),
        })
      }
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        toast({ 
          title: t('common.error'), 
          description: 'Invalid JSON file', 
          variant: 'destructive' 
        })
      } else {
        toast({ 
          title: t('common.error'), 
          description: error?.message || t('anonymize.toast.errorDesc'), 
          variant: 'destructive' 
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!anonymized) return
    downloadFile(anonymized, 'anonymized-data.json', 'application/json')
    toast({
      title: t('common.exported'),
      description: 'File downloaded successfully',
      variant: 'info'
    })
  }

  const copyToClipboard = async () => {
    if (!anonymized) return
    try {
      await navigator.clipboard.writeText(anonymized)
      toast({
        title: t('common.copiedTitle'),
        description: t('anonymize.copyToastDesc'),
      })
    } catch {
      toast({
        title: t('common.error'),
        description: t('common.copyErrorDescription'),
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panneau de saisie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {t('anonymize.rawData')}
            </CardTitle>
            <CardDescription>
              {t('anonymize.instruction')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t('anonymize.placeholder')}
              className="min-h-[300px] font-mono text-sm"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <FileUpload
              accept=".json"
              maxSize={10}
              onFileSelect={handleFileSelect}
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button onClick={handleAnonymize} disabled={!jsonInput.trim() || loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                {t('anonymize.button.anonymize')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setJsonInput('')
                  setAnonymized(null)
                }}
              >
                {t('common.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panneau de résultat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('anonymize.resultTitle')}
            </CardTitle>
            <CardDescription>
              {anonymized ? t('anonymize.resultLabel') : t('anonymize.resultPlaceholder')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {anonymized ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{t('common.json')}</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      {t('common.copy')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      {t('common.export')}
                    </Button>
                  </div>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[350px] text-sm">
                  <code>{anonymized}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('anonymize.noDataTitle')}</p>
                  <p className="text-sm">{t('anonymize.noDataDesc')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 