"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspace } from "@/lib/workspace"
import type { StartupProfile } from "@/lib/types"

type EditProfileContextValue = { openEditProfile: () => void }

const EditProfileContext = createContext<EditProfileContextValue | null>(null)

export function EditProfileProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const value = useMemo<EditProfileContextValue>(() => ({ openEditProfile: () => setOpen(true) }), [])
  return (
    <EditProfileContext.Provider value={value}>
      {children}
      <EditProfileDialog open={open} onOpenChange={setOpen} />
    </EditProfileContext.Provider>
  )
}

export function useEditProfile(): EditProfileContextValue {
  const ctx = useContext(EditProfileContext)
  if (!ctx) throw new Error("useEditProfile must be used inside <EditProfileProvider>")
  return ctx
}

const LIST_FIELDS = [
  { key: "industry", label: "Industry", placeholder: "AgriTech, Climate tech" },
  { key: "products", label: "Products", placeholder: "Crop monitoring platform, Yield forecasting" },
  { key: "capabilities", label: "Core capabilities", placeholder: "Satellite analytics, Agronomy models" },
  { key: "technologies", label: "Technologies", placeholder: "Computer vision, IoT sensors" },
  { key: "targetMarkets", label: "Target markets", placeholder: "Malaysia, Indonesia, Thailand" },
  { key: "targetCustomers", label: "Target customers", placeholder: "Plantation operators, Agribusinesses" },
  { key: "growthPriorities", label: "Growth priorities", placeholder: "Commercial pilots, Regional expansion" },
] as const

type ListKey = (typeof LIST_FIELDS)[number]["key"]

type FormState = Record<ListKey, string> & {
  name: string
  description: string
  businessModel: string
  stage: string
  incorporationCountry: string
}

function toForm(p: StartupProfile): FormState {
  return {
    name: p.name,
    description: p.description,
    businessModel: p.businessModel,
    stage: p.stage ?? "",
    incorporationCountry: p.incorporationCountry ?? "",
    industry: p.industry.join(", "),
    products: p.products.join(", "),
    capabilities: p.capabilities.join(", "),
    technologies: p.technologies.join(", "),
    targetMarkets: p.targetMarkets.join(", "),
    targetCustomers: p.targetCustomers.join(", "),
    growthPriorities: p.growthPriorities.join(", "),
  }
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function EditProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {open ? <EditProfileForm onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function EditProfileForm({ onDone }: { onDone: () => void }) {
  const { state, updateProfile } = useWorkspace()
  const profile = state.profile
  const [form, setForm] = useState<FormState>(() => toForm(profile))
  const [touched, setTouched] = useState(false)

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const nameMissing = form.name.trim().length === 0
  const descriptionMissing = form.description.trim().length === 0

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (nameMissing || descriptionMissing) return
    const stage = form.stage.trim() || undefined
    const incorporationCountry = form.incorporationCountry.trim() || undefined
    // Drop "missing information" items the founder has just supplied.
    const missingInformation = profile.missingInformation.filter((item) => {
      if (!profile.stage && stage && /\bstage\b/i.test(item)) return false
      if (!profile.incorporationCountry && incorporationCountry && /incorporat/i.test(item)) return false
      return true
    })
    const next: StartupProfile = {
      ...profile,
      name: form.name.trim(),
      description: form.description.trim(),
      businessModel: form.businessModel.trim(),
      stage,
      incorporationCountry,
      industry: splitList(form.industry),
      products: splitList(form.products),
      capabilities: splitList(form.capabilities),
      technologies: splitList(form.technologies),
      targetMarkets: splitList(form.targetMarkets),
      targetCustomers: splitList(form.targetCustomers),
      growthPriorities: splitList(form.growthPriorities),
      missingInformation,
    }
    updateProfile(next)
    toast.success("Profile updated", { description: "Fit scores and eligibility were recalculated." })
    onDone()
  }

  return (
    <form onSubmit={onSubmit} className="flex max-h-[90dvh] flex-col">
      <DialogHeader className="border-b px-6 py-5 text-left">
        <p className="eyebrow">Startup profile</p>
        <DialogTitle className="font-display text-3xl font-normal">Edit profile</DialogTitle>
        <DialogDescription>
          UpperTune re-runs fit scoring and eligibility checks against this profile as soon as you save.
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="ep-name" label="Startup name" error={touched && nameMissing ? "Name is required" : undefined}>
            <Input id="ep-name" value={form.name} onChange={set("name")} aria-invalid={touched && nameMissing} />
          </Field>
          <Field id="ep-stage" label="Stage" hint="Leave blank if not yet decided">
            <Input id="ep-stage" value={form.stage} onChange={set("stage")} placeholder="e.g. Seed" />
          </Field>
        </div>
        <Field
          id="ep-description"
          label="One-sentence description"
          error={touched && descriptionMissing ? "Description is required" : undefined}
        >
          <Textarea
            id="ep-description"
            rows={3}
            value={form.description}
            onChange={set("description")}
            aria-invalid={touched && descriptionMissing}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="ep-business-model" label="Business model">
            <Input id="ep-business-model" value={form.businessModel} onChange={set("businessModel")} />
          </Field>
          <Field id="ep-incorporation" label="Country of incorporation" hint="Used for funding eligibility checks">
            <Input
              id="ep-incorporation"
              value={form.incorporationCountry}
              onChange={set("incorporationCountry")}
              placeholder="e.g. Malaysia"
            />
          </Field>
        </div>
        <div className="rounded-xl border bg-background/60 p-4">
          <p className="eyebrow mb-4">Lists · separate entries with commas</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {LIST_FIELDS.map((f) => (
              <Field key={f.key} id={`ep-${f.key}`} label={f.label}>
                <Input id={`ep-${f.key}`} value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder} />
              </Field>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter className="flex-col gap-3 border-t bg-background/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">Saving clears generated documents written for the previous profile.</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit">Save profile</Button>
        </div>
      </DialogFooter>
    </form>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
