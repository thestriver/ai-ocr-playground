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
          className="justify-between w-fit font-normal"
        >
          <div className="flex items-center gap-2">
            {selectedModelData?.icon && (
              <Image
                src={selectedModelData.icon}
                alt={selectedModelData.label.split(" / ")[0]}
                width={16}
                height={16}
              />
            )}
            {selectedModel}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 cursor-pointer bg-white dark:bg-slate-950 border rounded-lg shadow-lg" align="start">
        <Command className="rounded-lg">
          <CommandInput
            placeholder="Search models..."
            className="h-11 px-3 border-none focus:ring-0 rounded-t-lg bg-transparent"
          />
          <CommandList className="px-1.5 pb-1.5">
            <CommandEmpty className="py-2 text-center text-sm">No models found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={() => {
                    setSelectedModel(model.label)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Image
                      src={model.icon}
                      alt={model.label.split(" / ")[0]}
                      width={16}
                      height={16}
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

