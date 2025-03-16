import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"

interface FilePreviewModalProps {
    file: File | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function FilePreviewModal({ file, open, onOpenChange }: FilePreviewModalProps) {
    const [preview, setPreview] = useState<string | null>(null)

    useEffect(() => {
        if (file && open) {
            if (file.type === "application/pdf") {
                const url = URL.createObjectURL(file)
                setPreview(url)
                return () => URL.revokeObjectURL(url)
            }
        } else {
            setPreview(null)
        }
    }, [file, open])

    if (!file) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTitle className="text-sm text-muted-foreground hidden">{file.name}</DialogTitle>
            <DialogContent className="max-w-4xl h-[80vh]">
                <div className="flex-1 min-h-0">
                    {preview && (
                        <iframe
                            src={preview}
                            className="w-full h-full rounded-md"
                            title={file.name}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 