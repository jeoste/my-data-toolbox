import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Copy, Loader2, Save, Code } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { useTranslation } from 'react-i18next'
import { downloadFile } from '@/components/file-upload'

function inferSchema(value: any): any {
  if (Array.isArray(value)) {
    return {
      type: 'array',
      items: value.length ? inferSchema(value[0]) : {},
    }
  }
  if (value === null) return { type: 'string', nullable: true }
  switch (typeof value) {
    case 'string':
      return { type: 'string' }
    case 'number':
      return { type: Number.isInteger(value) ? 'integer' : 'number' }
    case 'boolean':
      return { type: 'boolean' }
    case 'object':
      const properties: Record<string, any> = {}
      for (const [k, v] of Object.entries(value)) {
        properties[k] = inferSchema(v)
      }
      return { type: 'object', properties }
    default:
      return { type: 'string' }
  }
}

function generateOpenApi(jsonObj: any) {
  const schema = inferSchema(jsonObj)
  const openapi = {
    openapi: '3.0.0',
    info: {
      title: 'Generated API',
      version: '1.0.0',
    },
    paths: {
      '/example': {
        get: {
          summary: 'Example endpoint',
          responses: {
            200: {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Root',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Root: schema,
      },
    },
  }
  return JSON.stringify(openapi, null, 2)
}

export function SwaggerView() {
  const [jsonInput, setJsonInput] = useState('')
  const [openapiSpec, setOpenapiSpec] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleGenerate = () => {
    setLoading(true)
    try {
      const obj = JSON.parse(jsonInput)
      const spec = generateOpenApi(obj)
      setOpenapiSpec(spec)
      toast({ 
        title: t('swagger.toast.successTitle'), 
        description: t('swagger.toast.successDesc') 
      })
    } catch (error: any) {
      toast({ 
        title: t('common.error'), 
        description: error.message || t('swagger.toast.errorDesc'), 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!openapiSpec) return
    try {
      await navigator.clipboard.writeText(openapiSpec)
      toast({ 
        title: t('common.copiedTitle'), 
        description: t('swagger.copyToastDesc') 
      })
    } catch {
      toast({ 
        title: t('common.error'), 
        description: t('common.copyErrorDescription'), 
        variant: 'destructive' 
      })
    }
  }

  const saveSpec = () => {
    if (!openapiSpec) return
    downloadFile(openapiSpec, 'openapi-spec.json', 'application/json')
    toast({ 
      title: t('common.success'), 
      description: t('swagger.saveToastDesc') 
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              {t('swagger.inputTitle')}
            </CardTitle>
            <CardDescription>{t('swagger.instruction')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t('swagger.placeholder')}
              className="min-h-[400px] font-mono text-sm"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleGenerate} disabled={!jsonInput.trim() || loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                {t('swagger.button.generate')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setJsonInput('')
                  setOpenapiSpec(null)
                }}
              >
                {t('common.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('swagger.resultTitle')}
            </CardTitle>
            <CardDescription>{openapiSpec ? t('swagger.resultLabel') : t('swagger.resultPlaceholder')}</CardDescription>
          </CardHeader>
          <CardContent>
            {openapiSpec ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{t('common.json')}</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      {t('common.copy')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveSpec}>
                      <Save className="w-4 h-4 mr-2" />
                      {t('common.save')}
                    </Button>
                  </div>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[350px] text-sm">
                  <code>{openapiSpec}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('swagger.noDataTitle')}</p>
                  <p className="text-sm">{t('swagger.noDataDesc')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 