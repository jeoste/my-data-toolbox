/**
 * API Client for communicating with the backend serverless functions
 */

export interface GenerateOptions {
  count?: number
  seed?: number
  pretty?: boolean
  locale?: string
}

export interface AnonymizeOptions {
  locale?: string
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: string
  metadata?: Record<string, any>
}

export interface GenerateResponse extends APIResponse {
  metadata?: {
    generatedAt: string
    itemCount: number
  }
}

export interface AnonymizeResponse extends APIResponse {
  metadata?: {
    anonymizedFields: number
    processedAt: string
  }
}

export interface AnalyzeResponse {
  success: boolean
  sensitiveFields: string[]
  totalFields: number
  error?: string
}

export interface ValidateXmlOptions {
  format?: boolean
}

export interface ValidateXmlResponse extends APIResponse {
  isValid: boolean
  formatted?: string
  structure?: {
    rootTag: string
    attributes: Record<string, string>
    childCount: number
    hasText: boolean
    childTags: Record<string, number>
  }
  error?: {
    code?: number
    message: string
    line?: number
    column?: number
    position?: number
  }
  metadata?: {
    validatedAt: string
  }
}

export interface XmlPathOptions {
  format?: 'json' | 'xml'
}

export interface XmlPathResponse extends APIResponse {
  results: any[]
  count: number
  metadata?: {
    evaluatedAt: string
    xpath: string
  }
}

export interface GenerateXmlOptions {
  seed?: number
  count?: number
}

export interface GenerateXmlResponse extends APIResponse {
  data?: string
  metadata?: {
    generatedAt: string
    itemCount: number
  }
}

export interface RandomJsonOptions {
  seed?: number
  depth?: number
  maxKeys?: number
  maxItems?: number
  locale?: string
}

export interface RandomJsonResponse extends APIResponse {
  data?: any
  metadata?: {
    generatedAt: string
    itemCount: number
    depth: number
    maxKeys: number
  }
}

export interface RandomXmlOptions {
  seed?: number
  depth?: number
  maxChildren?: number
  maxItems?: number
  rootTag?: string
}

export interface RandomXmlResponse extends APIResponse {
  data?: string
  metadata?: {
    generatedAt: string
    itemCount: number
    depth: number
    maxChildren: number
  }
}

class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class APIClient {
  private baseURL: string

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  /**
   * Generate JSON data from a skeleton
   */
  async generate(
    skeleton: any,
    swagger?: any,
    options?: GenerateOptions
  ): Promise<GenerateResponse> {
    const body = {
      skeleton,
      ...(swagger && { swagger }),
      options: {
        ...(options?.count !== undefined && { count: options.count }),
        ...(options?.seed !== undefined && { seed: options.seed }),
        ...(options?.locale && { locale: options.locale }),
      },
    }

    return this.request<GenerateResponse>('/api/generate', body)
  }

  /**
   * Anonymize JSON data
   */
  async anonymize(
    data: any,
    options?: AnonymizeOptions
  ): Promise<AnonymizeResponse> {
    const body = {
      data,
      options: {
        ...(options?.locale && { locale: options.locale }),
      },
    }

    return this.request<AnonymizeResponse>('/api/anonymize', body)
  }

  /**
   * Analyze sensitive fields in JSON data
   */
  async analyze(data: any): Promise<AnalyzeResponse> {
    const body = { data }

    return this.request<AnalyzeResponse>('/api/analyze', body)
  }

  /**
   * Validate XML structure
   */
  async validateXml(
    xml: string,
    options?: ValidateXmlOptions
  ): Promise<ValidateXmlResponse> {
    const body = {
      xml,
      options: {
        ...(options?.format !== undefined && { format: options.format }),
      },
    }

    return this.request<ValidateXmlResponse>('/api/xml-validate', body)
  }

  /**
   * Evaluate XPath expression on XML
   */
  async evaluateXmlPath(
    xml: string,
    xpath: string,
    options?: XmlPathOptions
  ): Promise<XmlPathResponse> {
    const body = {
      xml,
      xpath,
      options: {
        ...(options?.format && { format: options.format }),
      },
    }

    return this.request<XmlPathResponse>('/api/xml-path', body)
  }

  /**
   * Generate XML data from a skeleton
   */
  async generateXml(
    skeleton: string,
    options?: GenerateXmlOptions
  ): Promise<GenerateXmlResponse> {
    const body = {
      skeleton,
      options: {
        ...(options?.count !== undefined && { count: options.count }),
        ...(options?.seed !== undefined && { seed: options.seed }),
      },
    }

    return this.request<GenerateXmlResponse>('/api/generate-xml', body)
  }

  /**
   * Generate random JSON structure with random data
   */
  async generateRandomJson(
    options?: RandomJsonOptions
  ): Promise<RandomJsonResponse> {
    const body = {
      options: {
        ...(options?.seed !== undefined && { seed: options.seed }),
        ...(options?.depth !== undefined && { depth: options.depth }),
        ...(options?.maxKeys !== undefined && { maxKeys: options.maxKeys }),
        ...(options?.maxItems !== undefined && { maxItems: options.maxItems }),
        ...(options?.locale && { locale: options.locale }),
      },
    }

    return this.request<RandomJsonResponse>('/api/random-json', body)
  }

  /**
   * Generate random XML structure with random data
   */
  async generateRandomXml(
    options?: RandomXmlOptions
  ): Promise<RandomXmlResponse> {
    const body = {
      options: {
        ...(options?.seed !== undefined && { seed: options.seed }),
        ...(options?.depth !== undefined && { depth: options.depth }),
        ...(options?.maxChildren !== undefined && { maxChildren: options.maxChildren }),
        ...(options?.maxItems !== undefined && { maxItems: options.maxItems }),
        ...(options?.rootTag && { rootTag: options.rootTag }),
      },
    }

    return this.request<RandomXmlResponse>('/api/random-xml', body)
  }

  /**
   * Make an HTTP request to the API
   */
  private async request<T>(endpoint: string, body: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new APIError(
          data.error || 'Request failed',
          response.status,
          data.details
        )
      }

      if (!data.success) {
        throw new APIError(
          data.error || 'Operation failed',
          response.status,
          data.details
        )
      }

      return data as T
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new APIError(
          'Network error: Unable to connect to the server',
          0,
          error.message
        )
      }

      throw new APIError(
        'An unexpected error occurred',
        500,
        error instanceof Error ? error.message : String(error)
      )
    }
  }
}

// Export a singleton instance
export const apiClient = new APIClient()

