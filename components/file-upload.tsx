"use client"

import type React from "react"

import { useState, useRef } from "react"
import { UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1MB size limit
  const MAX_FILE_SIZE = 1 * 1024 * 1024
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFiles = (files: File[]) => {
    setError(null)
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`)
        return false
      }
      return true
    })
    return validFiles
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files)
      const validFiles = validateFiles(filesArray)
      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      const validFiles = validateFiles(filesArray)
      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }

      // Reset the input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-4 text-center",
        isDragging ? "border-primary bg-primary/5" : "border-border",
        error ? "border-destructive" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="File upload"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      <div className="flex flex-col items-center justify-center gap-2">
        <div className={cn("p-2 rounded-full", error ? "bg-destructive/10" : "bg-primary/10")}>
          <UploadIcon className={cn("h-6 w-6", error ? "text-destructive" : "text-primary")} />
        </div>
        <div>
          <p className="text-sm font-medium">Drag and drop files here or click to upload for OCR</p>
          <p className="text-xs text-muted-foreground mt-1">
            Support for PDF documents OCR up to {formatFileSize(MAX_FILE_SIZE)}
          </p>
          {error && (
            <p className="text-xs text-destructive mt-1">
              {error}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleButtonClick} className="mt-2">
          Select Files
        </Button>
      </div>
    </div>
  )
}

