import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, FilePlus, Copy, Loader2, FileText, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/api-client'
import { FileUpload, readFileAsText, downloadFile } from '@/components/file-upload'

export function GenerateXmlView() {
  const [skeleton, setSkeleton] = useState('')
  const [generated, setGenerated] = useState<string | null>(null)
  const [seed, setSeed] = useState<string>('')
  const [count, setCount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleGenerate = async () => {
    setLoading(true)
    try {
      // Validation rapide du XML
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(skeleton, 'text/xml')
      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        throw new Error('Invalid XML structure')
      }

      const response = await apiClient.generateXml(
        skeleton,
        {
          seed: seed ? Number(seed) : undefined,
          count: count ? Number(count) : undefined,
        }
      )

      if (response?.success && response.data) {
        setGenerated(response.data)
        toast({ 
          title: t('generateXml.toast.successTitle'), 
          description: t('generateXml.toast.successDesc'),
          variant: 'success'
        })
      } else {
        throw new Error('Generation failed')
      }
    } catch (error: any) {
      toast({ 
        title: t('common.error'), 
        description: error?.message || t('generateXml.toast.errorDesc'), 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    try {
      const content = await readFileAsText(file)
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(content, 'text/xml')
      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        throw new Error('Invalid XML file')
      }
      setSkeleton(content)

      // Auto-generate after import
      setLoading(true)
      const response = await apiClient.generateXml(
        content,
        {
          seed: seed ? Number(seed) : undefined,
          count: count ? Number(count) : undefined,
        }
      )

      if (response?.success && response.data) {
        setGenerated(response.data)
        toast({ 
          title: t('generateXml.toast.successTitle'), 
          description: t('generateXml.toast.successDesc'),
          variant: 'success'
        })
      }
    } catch (error: any) {
      if (error.message === 'Invalid XML file') {
        toast({ 
          title: t('common.error'), 
          description: 'Invalid XML file', 
          variant: 'destructive' 
        })
      } else {
        toast({ 
          title: t('common.error'), 
          description: error?.message || t('generateXml.toast.errorDesc'), 
          variant: 'destructive' 
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!generated) return
    downloadFile(generated, 'generated-data.xml', 'application/xml')
    toast({
      title: t('common.exported'),
      description: 'File downloaded successfully',
      variant: 'info'
    })
  }

  const copyToClipboard = async () => {
    if (!generated) return
    try {
      await navigator.clipboard.writeText(generated)
      toast({ 
        title: t('common.copiedTitle'), 
        description: t('generateXml.copyToastDesc'),
        variant: 'info'
      })
    } catch {
      toast({ 
        title: t('common.error'), 
        description: t('common.copyErrorDescription'), 
        variant: 'destructive' 
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
              <FileText className="w-5 h-5" />
              {t('generateXml.skeletonTitle')}
            </CardTitle>
            <CardDescription>
              {t('generateXml.instruction')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t('generateXml.placeholder')}
              className="min-h-[300px] font-mono text-sm"
              value={skeleton}
              onChange={(e) => setSkeleton(e.target.value)}
            />
            <FileUpload
              accept=".xml"
              maxSize={10}
              onFileSelect={handleFileSelect}
              disabled={loading}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder={t('generateXml.seedPlaceholder')}
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
              <Input
                type="number"
                placeholder={t('generateXml.countPlaceholder')}
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGenerate} disabled={!skeleton.trim() || loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                {t('generateXml.button.generate')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSkeleton('')
                  setGenerated(null)
                  setSeed('')
                  setCount('')
                }}
                disabled={loading}
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
              <Zap className="w-5 h-5" />
              {t('generateXml.resultTitle')}
            </CardTitle>
            <CardDescription>{generated ? t('generateXml.resultLabel') : t('generateXml.resultPlaceholder')}</CardDescription>
          </CardHeader>
          <CardContent>
            {generated ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">XML</Badge>
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
                  <code>{generated}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('generateXml.noDataTitle')}</p>
                  <p className="text-sm">{t('generateXml.noDataDesc')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

