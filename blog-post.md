# Building a OCR Application with Mistral OCR AI Model, React and TypeScript

Document processing has traditionally been a complex task requiring multiple tools and OCR engines. With Mistral AI's new OCR capabilities, we can build powerful document processing applications with minimal setup. Let's explore how to implement Mistral OCR in a modern Next.js application.

## The Challenge

Processing PDFs and extracting structured text has always been challenging. Developers often face:
- Complex OCR library setups
- Inconsistent text formatting
- Poor handling of multi-page documents
- Limited markdown support
- High costs for enterprise solutions

Mistral OCR provides a solution that's both powerful and developer-friendly, with native markdown support and excellent formatting preservation.

## Setting Up the Project

First, let's set up our Next.js project with the necessary dependencies:

```bash
# Create a new Next.js project
npx create-next-app@latest my-ocr-app --typescript --tailwind --app

# Install required dependencies
npm install react-markdown
```

Add your Mistral API key to your environment variables:

```env
MISTRAL_API_KEY=your-api-key-here
```

## Backend Implementation

Here's the core implementation for processing documents with Mistral OCR:

```typescript
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

async function processPDF(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())
  
  // Step 1: Upload the file
  const formData = new FormData()
  formData.append('purpose', 'ocr')
  formData.append('file', new Blob([buffer], { type: file.type }), file.name)
  
  const uploadResponse = await fetch('https://api.mistral.ai/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.MISTRAL_API_KEY}\`,
    },
    body: formData
  })

  if (!uploadResponse.ok) {
    throw new Error('File upload failed')
  }

  const { id: fileId } = await uploadResponse.json()

  // Step 2: Get signed URL
  const signedUrlResponse = await fetch(
    \`https://api.mistral.ai/v1/files/\${fileId}/url?expiry=24\`,
    {
      method: 'GET',
      headers: {
        'Authorization': \`Bearer \${process.env.MISTRAL_API_KEY}\`,
        'Accept': 'application/json'
      }
    }
  )

  const { url: signedUrl } = await signedUrlResponse.json()

  // Step 3: Process with OCR
  const ocrResponse = await fetch('https://api.mistral.ai/v1/ocr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${process.env.MISTRAL_API_KEY}\`,
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

  const ocrData = await ocrResponse.json() as MistralOCRResponse
  return ocrData.pages?.map(page => page.markdown).join('\\n\\n')
}
```

## Frontend Implementation

Let's create a custom hook to manage the OCR state and processing:

```typescript
// hooks/use-ocr.ts
import { useState } from "react"

interface OCRResult {
  result: string
  processingTime: number
}

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processDocument = async (file: File) => {
    try {
      setIsProcessing(true)
      setError(null)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(\`OCR processing failed: \${response.statusText}\`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return { isProcessing, result, error, processDocument }
}
```

And here's how to use it in your page:

```typescript
// app/page.tsx
"use client"

import { useOCR } from "@/hooks/use-ocr"
import ReactMarkdown from 'react-markdown'

export default function OCRPage() {
  const { isProcessing, result, error, processDocument } = useOCR()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processDocument(file)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mistral OCR Demo</h1>
      
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {isProcessing && <div>Processing document...</div>}
      
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {result && (
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-2">
            Processed in {(result.processingTime / 1000).toFixed(2)}s
          </div>
          <div className="prose dark:prose-invert">
            <ReactMarkdown>{result.result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
```

## Key Features

Our implementation provides several advantages:

1. **Native Markdown Output**: Results are returned in well-formatted markdown
2. **Multi-page Support**: Handles documents of any length
3. **Clean Text Formatting**: Preserves document structure and layout
4. **Error Handling**: Robust error management at each step
5. **Type Safety**: Full TypeScript support with proper interfaces

## Performance and Limitations

Mistral OCR performs exceptionally well with:
- PDF documents
- Scanned text
- Multi-column layouts
- Tables and structured content
- Multiple languages

Current limitations include:
- Maximum file size of 32MB
- Processing time varies with document complexity
- Rate limits based on API tier

## Best Practices

1. **Error Handling**: Implement robust error handling at each step
2. **File Validation**: Check file types and sizes before processing
3. **Progress Tracking**: Implement processing status updates
4. **Cleanup**: Delete uploaded files after processing
5. **Caching**: Cache results for frequently accessed documents

## Conclusion

Mistral OCR provides a powerful solution for document processing that's both developer-friendly and production-ready. By following this implementation, you can quickly build a robust OCR system that handles complex documents with ease.


## Future Enhancements
Some potential improvements for future versions:
1. Integration with Vercel AI SDK for streaming responses
2. Batch processing capabilities
3. Result comparison analytics
4. Custom model fine-tuning interface

## Resources
- [Mistral OCR Documentation](https://docs.mistral.ai/capabilities/document/#ocr-with-uploaded-pdf)
- [Mistral OCR Release](https://mistral.ai/news/mistral-ocr)
- [Next.js Documentation](https://nextjs.org/docs)

---

Tags: #MistralAI #OCR #NextJS #TypeScript #DocumentProcessing 