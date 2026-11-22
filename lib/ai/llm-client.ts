import OpenAI from 'openai'

let client: OpenAI | null = null

export const LLM_MODEL = process.env.KIMI_MODEL || 'kimi-k3.1-pro'

function getClient(): OpenAI {
  if (client) return client

  const apiKey = process.env.KIMI_API_KEY
  if (!apiKey) {
    throw new Error('KIMI_API_KEY is not configured')
  }

  client = new OpenAI({
    apiKey,
    baseURL: process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1',
  })
  return client
}

interface StructuredResponseOptions {
  schemaName: string
  schema: Record<string, unknown>
  instructions: string
  input: string
  maxOutputTokens: number
}

export async function generateStructuredResponse<T>({
  schemaName,
  schema,
  instructions,
  input,
  maxOutputTokens,
}: StructuredResponseOptions): Promise<T> {
  const response = await getClient().responses.create({
    model: LLM_MODEL,
    instructions,
    input,
    max_output_tokens: maxOutputTokens,
    reasoning: { effort: 'low' },
    store: false,
    text: {
      format: {
        type: 'json_schema',
        name: schemaName,
        strict: true,
        schema,
      },
    },
  })

  if (!response.output_text) {
    throw new Error(`Kimi returned no structured output (status: ${response.status})`)
  }

  return JSON.parse(response.output_text) as T
}

export function getLLMErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const status = (error as { status?: unknown }).status
  return typeof status === 'number' ? status : undefined
}
