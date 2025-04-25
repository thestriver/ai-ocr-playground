import { NextRequest } from "next/server"
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { mistral } from '@ai-sdk/mistral'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

interface MistralOCRPage {
  index: number
  markdown: string
  images: any[]
  dimensions: {
    dpi: number
    height: number
    width: number
  }
}

interface MistralOCRResponse {
  pages: MistralOCRPage[]
}

export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const models = JSON.parse(formData.get("models") as string)

    console.log(`[OCR API] Processing file: ${file.name} (${file.type}) with models:`, 
      models.map((m: any) => `${m.provider}/${m.model}`))

    if (!file) {
      return new Response("No file provided", { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const results = await Promise.allSettled(
      models.map(async (model: any) => {
        const startTime = Date.now()
        let result
        
        console.log(`[OCR API] Starting ${model.provider} processing...`)

        try {
          switch (model.provider.toLowerCase()) {
            case "mistral":
              // Vercel AI SDK implementation (currently not supported for Mistral OCR)
              /*
              result = await generateText({
                model: mistral('mistral-small-latest'),
                messages: [
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'text',
                        text: 'Extract and format the text content from this document.',
                      },
                      {
                        type: 'file',
                        data: buffer.toString('base64'),
                        mimeType: file.type,
                      },
                    ],
                  },
                ],
                providerOptions: {
                  mistral: {
                    documentImageLimit: 8,
                    documentPageLimit: 64,
                  },
                },
              })
              */

              // Native Mistral API implementation
              // First upload the file
              const formData = new FormData()
              formData.append('purpose', 'ocr')
              formData.append('file', new Blob([buffer], { type: file.type }), file.name)
              
              const uploadResponse = await fetch('https://api.mistral.ai/v1/files', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                },
                body: formData
              })

              if (!uploadResponse.ok) {
                throw new Error(`Mistral file upload failed: ${uploadResponse.statusText}`)
              }

              const { id: fileId } = await uploadResponse.json()

              // Get signed URL
              const signedUrlResponse = await fetch(`https://api.mistral.ai/v1/files/${fileId}/url?expiry=24`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                  'Accept': 'application/json'
                }
              })

              if (!signedUrlResponse.ok) {
                throw new Error(`Failed to get signed URL: ${signedUrlResponse.statusText}`)
              }

              const { url: signedUrl } = await signedUrlResponse.json()

              // Then process with OCR using the signed URL
              const ocrResponse = await fetch('https://api.mistral.ai/v1/ocr', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                },
                body: JSON.stringify({
                  model: 'mistral-ocr-latest',
                  document: {
                    type: 'document_url',
                    document_url: signedUrl,
                  },
                  include_image_base64: false
                })
              })

              if (!ocrResponse.ok) {
                throw new Error(`Mistral OCR processing failed: ${ocrResponse.statusText}`)
              }

              const ocrData = await ocrResponse.json() as MistralOCRResponse
              // Mistral returns pages array with markdown content
              result = ocrData.pages?.map((page: MistralOCRPage) => page.markdown).join('\n\n') || 'No text extracted'
              break

            case "openai":
              // Map the model identifier to actual OpenAI model name
              const openaiModelMap: Record<string, string> = {
                'gpt-4o': 'gpt-4o',
                'gpt-4.1': 'gpt-4.1',
                'gpt-4.1-mini': 'gpt-4.1-mini'
              }
              const openaiModelName = openaiModelMap[model.model as string] || model.model
              
              const openaiResult = await generateText({
                model: openai.responses(openaiModelName),
                messages: [
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'text',
                        text: 'Extract and format the text content from this document. Return only the extracted text content, without any prefixes or explanations.',
                      },
                      {
                        type: 'file',
                        data: buffer,
                        mimeType: file.type,
                        filename: file.name,
                      },
                    ],
                  },
                ],
              })
              result = openaiResult.text || 'No text extracted'
              break

            case "google":
              const googleResult = await generateText({
                model: google('gemini-2.0-flash-001'),
                messages: [
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'text',
                        text: 'Extract and format the text content from this document. Return only the extracted text content, without any prefixes or explanations.',
                      },
                      {
                        type: 'file',
                        data: buffer,
                        mimeType: file.type,
                      },
                    ],
                  },
                ],
              })
              result = googleResult.text || 'No text extracted'
              break

            case "anthropic":
              const anthropicResult = await generateText({
                model: anthropic('claude-3-7-sonnet-20250219'),
                messages: [
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'text',
                        text: 'Extract and format the text content from this document. Return only the extracted text content, without any prefixes or explanations.',
                      },
                      {
                        type: 'file',
                        data: buffer,
                        mimeType: file.type,
                      },
                    ],
                  },
                ],
              })
              result = anthropicResult.text || 'No text extracted'
              break

            default:
              throw new Error(`Unsupported provider: ${model.provider}`)
          }

          const endTime = Date.now()
          console.log(`[OCR API] ${model.provider} completed in ${(endTime - startTime) / 1000}s`)
          console.log(`[OCR API] ${model.provider} result:`, result)
          
          return {
            provider: model.provider,
            model: model.model,
            result: result,
            processingTime: endTime - startTime,
          }
        } catch (error) {
          console.error(`[OCR API] ${model.provider} processing failed:`, error)
          throw error
        }
      })
    )

    console.log(`[OCR API] All processing completed`)
    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("[OCR API] Processing error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
} 