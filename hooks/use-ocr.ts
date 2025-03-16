import { useState } from "react"

interface OCRResult {
  provider: string
  model: string
  result: any
  processingTime: number
}

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<Record<string, OCRResult>>({})
  const [error, setError] = useState<string | null>(null)

  const processDocument = async (file: File, models: any[]) => {
    try {
      console.log(`[OCR Client] Starting processing for ${file.name}`)
      console.log(`[OCR Client] Selected models:`, models.map(m => `${m.provider}/${m.model}`))
      
      setIsProcessing(true)
      setError(null)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("models", JSON.stringify(models))

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`OCR processing failed: ${response.statusText}`)
      }

      const data = await response.json()
      const processedResults: Record<string, OCRResult> = {}

      console.log(`[OCR Client] Processing results...`)
      
      data.results.forEach((result: PromiseSettledResult<OCRResult>) => {
        if (result.status === "fulfilled") {
          const { provider, model } = result.value
          const key = `${provider}-${model}`.toLowerCase()
          processedResults[key] = result.value
          console.log(`[OCR Client] ${key} result:`, {
            processingTime: `${result.value.processingTime / 1000}s`,
            resultLength: result.value.result?.length || 0,
            result: result.value.result?.substring(0, 100) + '...' // First 100 chars
          })
        } else {
          console.error(`[OCR Client] Failed to process with model:`, result.reason)
        }
      })

      setResults(processedResults)
      console.log(`[OCR Client] Final results state:`, Object.keys(processedResults).map(key => ({
        key,
        processingTime: `${processedResults[key].processingTime / 1000}s`,
        hasResult: !!processedResults[key].result
      })))
      
    } catch (err: any) {
      const errorMessage = err.message
      console.error("[OCR Client] Processing error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    isProcessing,
    results,
    error,
    processDocument,
    setResults,
  }
} 