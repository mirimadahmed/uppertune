"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertTriangle, Loader2, Pencil, RefreshCw, RotateCcw, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Pill, ProvenanceBadge } from "@/components/shared/badges"
import { CopyButton } from "@/components/shared/copy-button"
import { documentToText, requestDocument } from "@/lib/ai-client"
import { useWorkspace } from "@/lib/workspace"
import { cn } from "@/lib/utils"
import type { GenerateKind, GeneratedDocument } from "@/lib/types"

const KIND_NOUN: Record<GenerateKind, string> = {
  pitch: "Pitch",
  poc: "POC outline",
  intro: "Introduction",
  strategy: "Application strategy",
}

function SectionBody({ body }: { body: string }) {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean)
  const isList = lines.length > 1 && lines.every((l) => /^[-•*]\s+/.test(l))
  if (isList) {
    return (
      <ul className="space-y-1.5">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed">
            <span className="mt-2 size-1 shrink-0 bg-primary" aria-hidden />
            <span>{l.replace(/^[-•*]\s+/, "")}</span>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <div className="space-y-2">
      {lines.map((l, i) => (
        <p key={i} className="text-sm leading-relaxed">
          {l.replace(/^[-•*]\s+/, "• ")}
        </p>
      ))}
    </div>
  )
}

function DocumentView({ doc }: { doc: GeneratedDocument }) {
  if (doc.sections.length === 1) {
    return (
      <div className="rounded-xl border bg-background/60 p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{doc.sections[0].body}</p>
      </div>
    )
  }
  return (
    <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
      {doc.sections.map((s, i) => (
        <div key={`${s.heading}-${i}`} className={cn(i === 0 && doc.sections.length % 2 === 1 && "md:col-span-2")}>
          <h4 className="eyebrow mb-1.5 !text-[10.5px]">{s.heading}</h4>
          <SectionBody body={s.body} />
        </div>
      ))}
    </div>
  )
}

export function GeneratedDocumentPanel({
  kind,
  targetId,
  title,
  description,
  generateLabel,
  autoGenerate = false,
  className,
}: {
  kind: GenerateKind
  targetId: string
  title: string
  description?: string
  generateLabel?: string
  autoGenerate?: boolean
  className?: string
}) {
  const { hydrated, state, getDocument, saveDocument, getEdit, saveEdit } = useWorkspace()
  const doc = getDocument(kind, targetId)
  const edit = getEdit(kind, targetId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const autoStarted = useRef(false)
  const noun = KIND_NOUN[kind]

  const generate = useCallback(
    async (isRegenerate: boolean) => {
      setLoading(true)
      setError(null)
      try {
        const next = await requestDocument(kind, targetId, state.profile)
        saveDocument(next)
        setEditing(false)
        toast.success(isRegenerate ? `${noun} regenerated` : `${noun} generated`)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed"
        setError(message)
        toast.error(`Couldn't generate the ${noun.toLowerCase()}`)
      } finally {
        setLoading(false)
      }
    },
    [kind, targetId, state.profile, saveDocument, noun],
  )

  useEffect(() => {
    if (autoGenerate && hydrated && !doc && !autoStarted.current) {
      autoStarted.current = true
      void generate(false)
    }
  }, [autoGenerate, hydrated, doc, generate])

  const currentText = edit ?? (doc ? documentToText(doc) : "")

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight">{title}</h3>
          {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {doc && !editing ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => void generate(true)} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" aria-hidden /> : <RefreshCw aria-hidden />}
              Regenerate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDraft(currentText)
                setEditing(true)
              }}
            >
              <Pencil aria-hidden />
              Edit
            </Button>
            <CopyButton text={currentText} toastMessage={`${noun} copied`} variant="default" />
          </div>
        ) : null}
      </div>

      {doc ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {doc.source === "gemma" ? (
            <>
              <ProvenanceBadge kind="ai" />
              <span>
                Generated by Gemma 4{doc.model ? ` · ${doc.model}` : ""} — review before sending
              </span>
            </>
          ) : (
            <>
              <ProvenanceBadge kind="template" />
              <span>{doc.note ?? "Generated from UpperTune demo templates."}</span>
            </>
          )}
          {edit !== undefined ? <Pill tone="info">Edited by you</Pill> : null}
        </div>
      ) : null}

      {editing ? (
        <div className="space-y-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-72 bg-background/60 font-sans text-sm leading-relaxed"
            aria-label={`Edit ${noun.toLowerCase()}`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                saveEdit(kind, targetId, draft)
                setEditing(false)
                toast.success("Changes saved")
              }}
            >
              Save changes
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            {edit !== undefined ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto text-muted-foreground"
                onClick={() => {
                  saveEdit(kind, targetId, null)
                  setEditing(false)
                  toast.success("Reverted to the generated version")
                }}
              >
                <RotateCcw aria-hidden />
                Revert to generated
              </Button>
            ) : null}
          </div>
        </div>
      ) : loading && !doc ? (
        <div className="space-y-3 rounded-xl border bg-background/60 p-4" aria-live="polite">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Drafting your {noun.toLowerCase()} from your profile and the documented context…
          </p>
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-10/12" />
          <Skeleton className="h-3.5 w-8/12" />
        </div>
      ) : doc ? (
        edit !== undefined ? (
          <div className="rounded-xl border bg-background/60 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{edit}</p>
          </div>
        ) : (
          <div className={cn("transition-opacity", loading && "opacity-50")}>
            <DocumentView doc={doc} />
          </div>
        )
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed bg-background/60 p-5">
          <p className="text-sm text-muted-foreground">
            Uses Gemma 4 when the server has an API key configured; otherwise UpperTune&apos;s clearly labelled demo
            templates. Nothing is sent to anyone.
          </p>
          <Button type="button" size="sm" onClick={() => void generate(false)} disabled={!hydrated || loading}>
            <Sparkles aria-hidden />
            {generateLabel ?? `Generate ${noun.toLowerCase()}`}
          </Button>
        </div>
      )}

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="flex-1">
            <p className="font-medium">Generation failed</p>
            <p className="text-danger/80">{error}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void generate(Boolean(doc))}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  )
}
