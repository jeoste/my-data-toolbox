import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { Layout } from '@/components/layout'
import { AnonymizeView } from '@/components/views/anonymize-view'
import { GenerateView } from '@/components/views/generate-view'
import { SwaggerView } from '@/components/views/swagger-view'
import { ValidatorView } from '@/components/views/validator-view'
import { GenerateFromSwaggerView } from '@/components/views/generate-from-swagger-view'
import { JsonPathView } from '@/components/views/jsonpath-view'
import { XmlValidateView } from '@/components/views/xml-validate-view'
import { XmlPathView } from '@/components/views/xml-path-view'
import { GenerateXmlView } from '@/components/views/generate-xml-view'
import { RandomJsonView } from '@/components/views/random-json-view'
import { RandomXmlView } from '@/components/views/random-xml-view'

export type ViewType = 'anonymize' | 'generate' | 'swagger' | 'swaggerToJson' | 'validator' | 'jsonpath' | 'xmlValidate' | 'xmlPath' | 'generateXml' | 'randomJson' | 'randomXml'

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('generate')

  const renderView = () => {
    switch (currentView) {
      case 'anonymize':
        return <AnonymizeView />
      case 'generate':
        return <GenerateView />
      case 'swagger':
        return <SwaggerView />
      case 'validator':
        return <ValidatorView />
      case 'swaggerToJson':
        return <GenerateFromSwaggerView />
      case 'jsonpath':
        return <JsonPathView />
      case 'xmlValidate':
        return <XmlValidateView />
      case 'xmlPath':
        return <XmlPathView />
      case 'generateXml':
        return <GenerateXmlView />
      case 'randomJson':
        return <RandomJsonView />
      case 'randomXml':
        return <RandomXmlView />
      default:
        return <GenerateView />
    }
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="my-data-toolbox-ui-theme">
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {renderView()}
      </Layout>
      <Toaster />
    </ThemeProvider>
  )
}

export default App 