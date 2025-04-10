"use client"

import { useState, useEffect } from "react"
import { PlusIcon, XIcon, FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModelCard } from "@/components/model-card"
import { ModelSelector } from "@/components/model-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { FileUpload } from "@/components/file-upload"
import { FilePreviewModal } from "@/components/file-preview-modal"
import { cn } from "@/lib/utils"
import { useOCR } from "@/hooks/use-ocr"

// Default model configurations
const defaultModels = [
  {
    id: 1,
    provider: "Mistral",
    model: "mistral-ocr-latest",
    description:
      "Mistral OCR comprehends each element of documents—media, text, tables, equations—with unprecedented accuracy and cognition. It extracts content in an ordered interleaved text and images format.",
    contextWindow: "1000 pages",
    selectorValue: "Mistral / mistral-ocr-latest",
    website: "https://mistral.ai",
  },
  {
    id: 2,
    provider: "OpenAI",
    model: "gpt-4o",
    description:
      "GPT-4 Optimized is OpenAI's most advanced model, delivering exceptional performance across language, vision, and reasoning tasks with improved speed and reliability.",
    contextWindow: "128,000 tokens",
    selectorValue: "OpenAI / gpt-4o",
    website: "https://openai.com",
  },
  {
    id: 3,
    provider: "Google",
    model: "gemini-2.0-flash-exp",
    description:
      "Gemini 2.0 Flash Experimental delivers next-gen features and improved capabilities, including superior speed, native tool use, multimodal generation, and a 1M token context window.",
    contextWindow: "1,000,000 tokens",
    selectorValue: "Google / gemini-2.0-flash-exp",
    website: "https://ai.google.dev",
  },
]

export default function Playground() {
  const [activePanels, setActivePanels] = useState(defaultModels)

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const { isProcessing, results, error, processDocument, setResults } = useOCR()

  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const addPanel = () => {
    if (activePanels.length >= 4) return

    const newId = Math.max(...activePanels.map((p) => p.id)) + 1
    const newPanel = {
      id: newId,
      provider: "Anthropic",
      model: "claude-3.7-sonnet",
      description:
        "Claude 3.7 Sonnet is Anthropic's latest model, delivering exceptional performance across language, vision, and reasoning tasks with improved efficiency.",
      contextWindow: "200,000 tokens",
      selectorValue: "Anthropic / claude-3.7-sonnet",
      website: "https://anthropic.com",
      icon: "/icons/anthropic.svg",
    }

    setActivePanels([...activePanels, newPanel])
  }

  const removePanel = (id: number) => {
    if (activePanels.length <= 1) return
    setActivePanels(activePanels.filter((panel) => panel.id !== id))
  }

  const handleFileUpload = async (files: File[]) => {
    const file = files[0] // Process one file at a time
    if (!file) return

    setUploadedFiles((prev) => [...prev, file])
    await processDocument(file, activePanels)
  }

  // Remove uploaded file and clear results
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    if (results) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Page] Clearing results after file removal')
      }
      setResults({})
    }
  }

  // Calculate grid columns based on number of panels
  const getGridClass = () => {
    switch (activePanels.length) {
      case 1:
        return "grid-cols-1"
      case 2:
        return "grid-cols-1 md:grid-cols-2"
      case 3:
        return "grid-cols-1 md:grid-cols-3"
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      default:
        return "grid-cols-1 md:grid-cols-2"
    }
  }

  // Get result for a specific panel
  const getPanelResult = (panel: typeof defaultModels[0]) => {
    if (!results) {
      console.log(`[Page] No results available for ${panel.provider}/${panel.model}`)
      return undefined
    }

    // Match the same key format used in the API response
    const key = `${panel.provider}-${panel.model}`.toLowerCase()
    const result = results[key]

    if (process.env.NODE_ENV === 'development' && result) {
      console.debug(`[Panel] ${key}: ${result.processingTime / 1000}s`)
    }

    return result || undefined
  }

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && results) {
      const summary = Object.entries(results).map(([key, value]) => ({
        model: key,
        time: `${value.processingTime / 1000}s`
      }))
      console.table(summary)
    }
  }, [results])

  return (
    <div className="flex flex-col min-h-screen">
      <FilePreviewModal
        file={previewFile}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      <header className="border-b">
        <div className="flex items-center h-14 px-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold"> 🔎 AI OCR Playground </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {activePanels.length < 4 && (
              <Button variant="outline" size="sm" onClick={addPanel} className="hidden md:flex">
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Model
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="p-4 border-b">
        <FileUpload onFilesSelected={handleFileUpload} />

        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Uploaded {uploadedFiles.length === 1 ? 'File' : 'Files'}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-secondary/50 hover:bg-secondary/70 transition-colors px-4 py-2 rounded-lg text-sm"
                >
                  <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        setPreviewFile(file)
                        setPreviewOpen(true)
                      }}
                    >
                      Preview
                    </Button>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="flex items-center justify-center gap-x-2 text-muted-foreground hover:text-destructive transition-colors bg-secondary/50 hover:bg-secondary/70 px-2 py-1 rounded-md"
                      title="Remove file"
                    >
                      Clear <XIcon className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      <main className={cn("flex-1 grid gap-px bg-border", getGridClass())}>
        {activePanels.map((panel) => {
          const result = getPanelResult(panel)
          return (
            <div key={panel.id} className="flex flex-col bg-background">
              <div className="flex items-center p-2 border-b">
                <ModelSelector defaultModel={panel.selectorValue} />
                <div className="ml-auto flex items-center gap-1">
                  {activePanels.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removePanel(panel.id)}>
                      <XIcon className="h-4 w-4" />
                    </Button>
                  )}
                  {activePanels.length < 4 && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={addPanel}>
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                <ModelCard
                  provider={panel.provider}
                  model={panel.model}
                  description={panel.description}
                  contextWindow={panel.contextWindow}
                  website={panel.website}
                  result={result}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}

