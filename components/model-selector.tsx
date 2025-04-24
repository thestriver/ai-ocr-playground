"use client"

import { useState } from "react"
import { Check, ChevronDown, Command as CommandIcon } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover"

const models = [
  {
    value: "mistral-ocr",
    label: "Mistral / mistral-ocr",
    icon: "/icons/mistral.svg",
  },
  {
    value: "openai-gpt4o",
    label: "OpenAI / gpt-4o",
    icon: "/icons/openai.svg",
  },
  {
    value: "google-gemini-flash",
    label: "Google / gemini-2.0-flash-exp",
    icon: "/icons/google.svg",
  },
  {
    value: "anthropic-claude3sonnet",
    label: "Anthropic / claude-3.7-sonnet",
    icon: "/icons/anthropic.svg",
  },
]

interface ModelSelectorProps {
  defaultModel?: string
}

export function ModelSelector({ defaultModel = "Mistral / mistral-ocr-latest" }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState(defaultModel)
  const selectedModelData = models.find(m => m.label === selectedModel)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[360px] justify-between font-normal bg-slate-950 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
        >
          <div className="flex items-center gap-2">
            {selectedModelData?.icon && (
              <Image
                src={selectedModelData.icon}
                alt={selectedModelData.label.split(" / ")[0]}
                width={16}
                height={16}
                className="rounded-sm"
              />
            )}
            {selectedModel}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0 cursor-pointer bg-slate-950 border-slate-800 rounded-md shadow-lg" align="start">
        <Command className="rounded-md">
          <CommandInput
            placeholder="Search models..."
            className="px-3 py-1 w-[360px] border-none focus:ring-0 focus:ring-offset-0 focus:outline-none bg-transparent text-slate-200"
          />
          <CommandList className="px-1.5 pb-1.5">
            <CommandEmpty className="py-2 text-center text-sm text-slate-400">No models found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={() => {
                    setSelectedModel(model.label)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm text-slate-200 aria-selected:bg-slate-800 hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Image
                      src={model.icon}
                      alt={model.label.split(" / ")[0]}
                      width={16}
                      height={16}
                      className="rounded-sm"
                    />
                    {model.label}
                  </div>
                  <Check className={cn("ml-auto h-4 w-4", selectedModel === model.label ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

