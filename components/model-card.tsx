import { ExternalLinkIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from 'react-markdown'

interface ModelCardProps {
  provider: string
  model: string
  description: string
  contextWindow: string
  website?: string
  result?: {
    result: any
    processingTime: number
  }
  isProcessing?: boolean
}

export function ModelCard({
  provider,
  model,
  description,
  contextWindow,
  website,
  result,
  isProcessing,
}: ModelCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4">
        {!result && !isProcessing ? (
          <>
            <p className="text-sm text-muted-foreground mb-4 h-32">{description}</p>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Context</div>
                <div className="text-sm">{contextWindow}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing document...
              </div>
            )}
            {result && (
              <div>
                <div className="text-sm font-medium">Results</div>
                <div className="text-sm mt-1">
                  <div className="text-xs text-muted-foreground mb-2">
                    Processed in {(result.processingTime / 1000).toFixed(2)}s
                  </div>
                  <div className="whitespace-pre-wrap font-mono text-xs bg-gray-900 p-3 rounded-md max-h-[420px] overflow-auto">
                    {typeof result.result === "string" ? (
                      <ReactMarkdown
                        components={{
                          code({ className, children }) {
                            return (
                              <code className={`${className} block p-2 bg-gray-900 rounded`}>
                                {children}
                              </code>
                            )
                          }
                        }}
                      >
                        {result.result}
                      </ReactMarkdown>
                    ) : (
                      JSON.stringify(result.result, null, 2)
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t px-4 py-3 flex items-center justify-between text-sm">
        {website && !result && !isProcessing && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={() => window.open(website, "_blank")}
          >
            Website <ExternalLinkIcon className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

