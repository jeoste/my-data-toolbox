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

