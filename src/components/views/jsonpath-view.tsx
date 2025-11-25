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
import { Search, FileText, Copy, FilePlus, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast-simple'
import { JSONPath } from 'jsonpath-plus'
import { useTranslation } from 'react-i18next'

export function JsonPathView() {
  const [jsonInput, setJsonInput] = useState('')
  const [pathExpr, setPathExpr] = useState('$.')
  const [result, setResult] = useState<string | null>(null)
  const [loading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleFileSelect = async (file: File) => {
    try {
      const content = await readFileAsText(file)
      setJsonInput(content)
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.message || t('jsonpath.toast.errorDesc'),
        variant: 'destructive',
      })
    }
  }

  const evaluatePath = () => {
    try {
      const json = JSON.parse(jsonInput)
      const extracted = JSONPath({ path: pathExpr, json })
      const formatted = JSON.stringify(extracted, null, 2)
      setResult(formatted)
      setError(null)
    } catch (err: any) {
      setResult(null)
      setError(err?.message || t('jsonpath.toast.extractionError'))
    }
  }

  // Évaluation automatique avec délai pour ne pas surcharger
  useEffect(() => {
    if (!jsonInput.trim() || !pathExpr.trim()) {
      setResult(null)
      setError(null)
      return
    }

    const timer = setTimeout(() => {
      evaluatePath()
    }, 500)

    return () => clearTimeout(timer)
  }, [jsonInput, pathExpr])

  const copyToClipboard = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      toast({ 
        title: t('common.copiedTitle'), 
        description: t('jsonpath.copyToastDesc') 
      })
    } catch {
      toast({
        title: t('common.error'),
        description: t('common.copyErrorDescription'),
        variant: 'destructive',
      })
    }
  }

  const quickExample = (expression: string, jsonExample?: string) => {
    setPathExpr(expression)
    if (jsonExample) {
      setJsonInput(jsonExample)
    }
  }

  // Exemple JSON pour démonstration
  const exampleJson = `{
  "users": [
    {
      "name": "John",
      "age": 25,
      "email": "john@example.com",
      "active": true
    },
    {
      "name": "Alice",
      "age": 17,
      "email": "alice@example.com", 
      "active": false
    },
    {
      "name": "Bob",
      "age": 30,
      "email": "bob@example.com",
      "active": true
    }
  ],
  "meta": {
    "total": 3,
    "page": 1
  }
}`

  // Exemple JSON pour les cas de test employees
  const employeesJson = `{
  "employees": {
    "employee": [
      {
        "id": "001",
        "name": "John Doe",
        "department": "Engineering"
      },
      {
        "id": "002", 
        "name": "Jane Smith",
        "department": "Marketing"
      },
      {
        "id": "003",
        "name": "Bob Wilson",
        "department": "Sales"
      }
    ]
  }
}`

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Instructions Panel - Collapsible at top */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {t('jsonpath.instructions.title')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CardTitle>
            <CardDescription>
              {t('jsonpath.instructions.description')}
            </CardDescription>
          </CardHeader>
          {showInstructions && (
            <CardContent className="space-y-4">
            {/* Basic Expressions */}
            <div>
              <h4 className="font-medium text-sm mb-2">{t('jsonpath.instructions.basic.title')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <code className="font-mono">$</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.basic.root')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <code className="font-mono">@</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.basic.current')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                     onClick={() => quickExample('$.users')}>
                  <code className="font-mono">$.users</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.basic.child')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                     onClick={() => quickExample("$['users']")}>
                  <code className="font-mono">$['users']</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.basic.bracket')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                     onClick={() => quickExample('$.*')}>
                  <code className="font-mono">$.*</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.basic.wildcard')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                     onClick={() => quickExample('$..')}>
                  <code className="font-mono">$..</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.basic.recursive')}</span>
                </div>
              </div>
            </div>

            {/* Arrays */}
            <div>
              <h4 className="font-medium text-sm mb-2">{t('jsonpath.instructions.arrays.title')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                     onClick={() => quickExample('$.users[*]', exampleJson)}>
                  <code className="font-mono">$.users[*]</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.arrays.all')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                     onClick={() => quickExample('$.users[0]', exampleJson)}>
                  <code className="font-mono">$.users[0]</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.arrays.index')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                     onClick={() => quickExample('$.users[1:3]', exampleJson)}>
                  <code className="font-mono">$.users[1:3]</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.arrays.slice')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                     onClick={() => quickExample('$.users[-1]', exampleJson)}>
                  <code className="font-mono">$.users[-1]</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.arrays.last')}</span>
                </div>
                                 <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                      onClick={() => quickExample('$.users[?(@.age > 18)]', exampleJson)}>
                   <code className="font-mono">$.users[?(@.age {'>'} 18)]</code>
                   <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.arrays.condition')}</span>
                 </div>
              </div>
            </div>

            {/* Filters */}
            <div>
              <h4 className="font-medium text-sm mb-2">{t('jsonpath.instructions.filters.title')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                     onClick={() => quickExample('$.users[?(@.name)]', exampleJson)}>
                  <code className="font-mono">$.users[?(@.name)]</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.filters.exists')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                     onClick={() => quickExample("$.users[?(@.name == 'John')]", exampleJson)}>
                  <code className="font-mono">$.users[?(@.name == 'John')]</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.filters.equals')}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                     onClick={() => quickExample("$.users[?(@.email =~ /.*@example.*/)]", exampleJson)}>
                  <code className="font-mono">$.users[?(@.email =~ /test/)]</code>
                  <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.filters.regex')}</span>
                </div>
                                 <div className="flex justify-between items-center p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                      onClick={() => quickExample("$.users[?(@.age > 18 && @.active == true)]", exampleJson)}>
                   <code className="font-mono">$.users[?(@.age {'>'} 18 && @.active)]</code>
                   <span className="text-muted-foreground text-xs">{t('jsonpath.instructions.filters.multiple')}</span>
                 </div>
              </div>
            </div>

            {/* Practical Examples */}
            <div>
              <h4 className="font-medium text-sm mb-2">{t('jsonpath.instructions.examples.title')}</h4>
              <div className="space-y-2 text-sm">
                <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2"
                        onClick={() => quickExample('$.users', exampleJson)}>
                  <div className="text-left">
                    <div className="font-mono text-xs">$.users</div>
                    <div className="text-muted-foreground text-xs">{t('jsonpath.instructions.examples.users')}</div>
                  </div>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2"
                        onClick={() => quickExample('$.users[*].name', exampleJson)}>
                  <div className="text-left">
                    <div className="font-mono text-xs">$.users[*].name</div>
                    <div className="text-muted-foreground text-xs">{t('jsonpath.instructions.examples.names')}</div>
                  </div>
                </Button>
                                 <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2"
                         onClick={() => quickExample('$.users[?(@.age >= 18)]', exampleJson)}>
                   <div className="text-left">
                     <div className="font-mono text-xs">$.users[?(@.age {'>='} 18)]</div>
                     <div className="text-muted-foreground text-xs">{t('jsonpath.instructions.examples.adults')}</div>
                   </div>
                 </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2"
                        onClick={() => quickExample('$..email', exampleJson)}>
                  <div className="text-left">
                    <div className="font-mono text-xs">$..email</div>
                    <div className="text-muted-foreground text-xs">{t('jsonpath.instructions.examples.emails')}</div>
                  </div>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2"
                        onClick={() => quickExample('$.users[?(@.active == true)][0]', exampleJson)}>
                  <div className="text-left">
                    <div className="font-mono text-xs">$.users[?(@.active)][0]</div>
                    <div className="text-muted-foreground text-xs">{t('jsonpath.instructions.examples.first')}</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Reference Syntax */}
            <div>
              <h4 className="font-medium text-sm mb-2">{t('jsonpath.instructions.syntax.title')}</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left font-medium">{t('jsonpath.instructions.syntax.table.expression')}</th>
                      <th className="p-2 text-left font-medium">{t('jsonpath.instructions.syntax.table.usage')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-2 font-mono">$</td>
                      <td className="p-2 text-muted-foreground">{t('jsonpath.instructions.syntax.operators.root')}</td>
                    </tr>
                    <tr className="border-t bg-muted/30">
                      <td className="p-2 font-mono">@</td>
                      <td className="p-2 text-muted-foreground">{t('jsonpath.instructions.syntax.operators.current')}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2 font-mono">. or []</td>
                      <td className="p-2 text-muted-foreground">{t('jsonpath.instructions.syntax.operators.child')}</td>
                    </tr>
                    <tr className="border-t bg-muted/30">
                      <td className="p-2 font-mono">..</td>
                      <td className="p-2 text-muted-foreground">{t('jsonpath.instructions.syntax.operators.recursive')}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2 font-mono">*</td>
                      <td className="p-2 text-muted-foreground">{t('jsonpath.instructions.syntax.operators.wildcard')}</td>
                    </tr>
                    <tr className="border-t bg-muted/30">
                      <td className="p-2 font-mono">[]</td>
                      <td className="p-2 text-muted-foreground">{t('jsonpath.instructions.syntax.operators.subscript')}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2 font-mono">?()</td>
                      <td className="p-2 text-muted-foreground">{t('jsonpath.instructions.syntax.operators.filter')}</td>
                    </tr>
                    <tr className="border-t bg-muted/30">
                      <td className="p-2 font-mono">()</td>
                      <td className="p-2 text-muted-foreground">{t('jsonpath.instructions.syntax.operators.script')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Test Cases */}
            <div>
              <h4 className="font-medium text-sm mb-2">{t('jsonpath.instructions.testCases.title')}</h4>
              <div className="space-y-2 text-sm">
                <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2"
                        onClick={() => quickExample('$.*', employeesJson)}>
                  <div className="text-left">
                    <div className="font-mono text-xs">$.*</div>
                    <div className="text-muted-foreground text-xs">{t('jsonpath.instructions.testCases.case1')}</div>
                  </div>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2"
                        onClick={() => quickExample('$.employees', employeesJson)}>
                  <div className="text-left">
                    <div className="font-mono text-xs">$.employees</div>
                    <div className="text-muted-foreground text-xs">{t('jsonpath.instructions.testCases.case2')}</div>
                  </div>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2"
                        onClick={() => quickExample('$.employees.employee', employeesJson)}>
                  <div className="text-left">
                    <div className="font-mono text-xs">$.employees.employee</div>
                    <div className="text-muted-foreground text-xs">{t('jsonpath.instructions.testCases.case3')}</div>
                  </div>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2"
                        onClick={() => quickExample("$.employees.employee['*'].id", employeesJson)}>
                  <div className="text-left">
                    <div className="font-mono text-xs">$.employees.employee['*'].id</div>
                    <div className="text-muted-foreground text-xs">{t('jsonpath.instructions.testCases.case4')}</div>
                  </div>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2"
                        onClick={() => quickExample('$.employees.employee[1].id', employeesJson)}>
                  <div className="text-left">
                    <div className="font-mono text-xs">$.employees.employee[1].id</div>
                    <div className="text-muted-foreground text-xs">{t('jsonpath.instructions.testCases.case5')}</div>
                  </div>
                </Button>
              </div>
            </div>
            </CardContent>
          )}
        </Card>

        {/* Main Content - Input and Result Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t('jsonpath.inputTitle')}
            </CardTitle>
            <CardDescription>
              {t('jsonpath.instruction')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t('jsonpath.placeholder')}
              className="min-h-[250px] font-mono text-sm"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <FileUpload
              accept=".json"
              maxSize={10}
              onFileSelect={handleFileSelect}
              disabled={loading}
            />
            <Input
              placeholder={t('jsonpath.pathPlaceholder')}
              value={pathExpr}
              onChange={(e) => setPathExpr(e.target.value)}
              className="font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={evaluatePath} variant="secondary" disabled={!jsonInput.trim() || !pathExpr.trim()}>
                <Search className="w-4 h-4 mr-2" />
                {t('jsonpath.button.extract')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setJsonInput('')
                  setResult(null)
                }}
                disabled={loading}
              >
                {t('common.clear')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickExample('$.users[*].name', exampleJson)}
              >
                Exemple Utilisateurs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickExample('$.employees.employee[*].id', employeesJson)}
              >
                Exemple Employés
              </Button>
            </div>
          </CardContent>
        </Card>

          {/* Result Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('jsonpath.resultTitle')}
              </CardTitle>
              <CardDescription>
                {error ? t('jsonpath.errorLabel') : result ? t('jsonpath.resultLabel') : t('jsonpath.resultPlaceholder')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-white">
                  {error}
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{t('common.json')}</Badge>
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      {t('common.copy')}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[350px] text-sm">
                    <code>{result}</code>
                  </pre>
                </div>
              ) : !error ? (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('jsonpath.noDataTitle')}</p>
                    <p className="text-sm">{t('jsonpath.noDataDesc')}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 