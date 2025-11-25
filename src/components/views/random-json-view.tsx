import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Copy, Loader2, Download, Shuffle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/api-client'
import { downloadFile } from '@/components/file-upload'

export function RandomJsonView() {
  const [generated, setGenerated] = useState<string | null>(null)
  const [seed, setSeed] = useState<string>('')
  const [depth, setDepth] = useState<string>('3')
  const [maxKeys, setMaxKeys] = useState<string>('5')
  const [maxItems, setMaxItems] = useState<string>('5')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await apiClient.generateRandomJson({
        seed: seed ? Number(seed) : undefined,
        depth: depth ? Number(depth) : 3,
        maxKeys: maxKeys ? Number(maxKeys) : 5,
        maxItems: maxItems ? Number(maxItems) : 5,
      })

      if (response?.success && response.data) {
        const formatted = JSON.stringify(response.data, null, 2)
        setGenerated(formatted)
        toast({ 
          title: t('randomJson.toast.successTitle'), 
          description: t('randomJson.toast.successDesc'),
          variant: 'success'
        })
      } else {
        throw new Error('Generation failed')
      }
    } catch (error: any) {
      toast({ 
        title: t('common.error'), 
        description: error?.message || t('randomJson.toast.errorDesc'), 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!generated) return
    downloadFile(generated, 'random-data.json', 'application/json')
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
        description: t('randomJson.copyToastDesc'),
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
        {/* Panneau de configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              {t('randomJson.configTitle')}
            </CardTitle>
            <CardDescription>
              {t('randomJson.instruction')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('randomJson.depthLabel')}
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder={t('randomJson.depthPlaceholder')}
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('randomJson.maxKeysLabel')}
                </label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  placeholder={t('randomJson.maxKeysPlaceholder')}
                  value={maxKeys}
                  onChange={(e) => setMaxKeys(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('randomJson.maxItemsLabel')}
                </label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  placeholder={t('randomJson.maxItemsPlaceholder')}
                  value={maxItems}
                  onChange={(e) => setMaxItems(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('randomJson.seedLabel')}
                </label>
                <Input
                  type="number"
                  placeholder={t('randomJson.seedPlaceholder')}
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                {t('randomJson.button.generate')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setGenerated(null)
                  setSeed('')
                  setDepth('3')
                  setMaxKeys('5')
                  setMaxItems('5')
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
              {t('randomJson.resultTitle')}
            </CardTitle>
            <CardDescription>{generated ? t('randomJson.resultLabel') : t('randomJson.resultPlaceholder')}</CardDescription>
          </CardHeader>
          <CardContent>
            {generated ? (
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
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-sm">
                  <code>{generated}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <Shuffle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('randomJson.noDataTitle')}</p>
                  <p className="text-sm">{t('randomJson.noDataDesc')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

