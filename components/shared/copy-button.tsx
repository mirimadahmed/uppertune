"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type ButtonProps = React.ComponentProps<typeof Button>

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const el = document.createElement("textarea")
      el.value = text
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(el)
      return ok
    } catch {
      return false
    }
  }
}

export function CopyButton({
  text,
  label = "Copy",
  toastMessage = "Copied to clipboard",
  variant = "outline",
  size = "sm",
  className,
}: {
  text: string
  label?: string
  toastMessage?: string
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const isIcon = typeof size === "string" && size.startsWith("icon")
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      aria-label={label}
      onClick={async () => {
        const ok = await copyText(text)
        if (ok) {
          setCopied(true)
          toast.success(toastMessage)
          window.setTimeout(() => setCopied(false), 1600)
        } else {
          toast.error("Couldn't access the clipboard")
        }
      }}
    >
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      {isIcon ? null : copied ? "Copied" : label}
    </Button>
  )
}
