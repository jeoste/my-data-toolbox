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
  const [lastError, setLastError] = useState<string | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleGenerate = async () => {
    if (loading) return
    
    setLoading(true)
    setLastError(null)
    try {
      const depthNum = depth && depth.trim() ? Number(depth) : 3
      const maxKeysNum = maxKeys && maxKeys.trim() ? Number(maxKeys) : 5
      const maxItemsNum = maxItems && maxItems.trim() ? Number(maxItems) : 5
      const seedNum = seed && seed.trim() ? Number(seed) : undefined

      const response = await apiClient.generateRandomJson({
        seed: seedNum && !isNaN(seedNum) ? seedNum : undefined,
        depth: !isNaN(depthNum) && depthNum > 0 ? depthNum : 3,
        maxKeys: !isNaN(maxKeysNum) && maxKeysNum > 0 ? maxKeysNum : 5,
        maxItems: !isNaN(maxItemsNum) && maxItemsNum > 0 ? maxItemsNum : 5,
      })

      if (response?.success && response.data) {
        const formatted = JSON.stringify(response.data, null, 2)
        setGenerated(formatted)
        setLastError(null)
        toast({ 
          title: t('randomJson.toast.successTitle'), 
          description: t('randomJson.toast.successDesc'),
          variant: 'success'
        })
      } else {
        throw new Error(response?.error || 'Generation failed')
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.details || t('randomJson.toast.errorDesc')
      
      // Only show error if it's different from the last one
      if (errorMessage !== lastError) {
        setLastError(errorMessage)
        console.error('Random JSON generation error:', error)
        toast({ 
          title: t('common.error'), 
          description: errorMessage, 
          variant: 'destructive' 
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!generated) return
    downloadFile(generated, 'random-data.json', 'application/json')
    toast({
      title: t('common.exported'),
      description: t('common.exportSuccess'),
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
    <div className="container mx-auto p-4 sm:p-6 max-w-[1600px]">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Configuration Panel */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              {t('randomJson.configTitle')}
            </CardTitle>
            <CardDescription>
              {t('randomJson.instruction')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {/* Result Panel */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {t('randomJson.resultTitle')}
            </CardTitle>
            <CardDescription>{generated ? t('randomJson.resultLabel') : t('randomJson.resultPlaceholder')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {generated ? (
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
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
                <pre className="bg-muted p-4 rounded-lg overflow-auto flex-1 text-sm min-h-[600px]">
                  <code>{generated}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[600px] text-muted-foreground">
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

