"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { demoStartup } from "@/data/demo-startup"
import { buildActionPlan, rankFunding, rankPartners, rankPeople } from "@/lib/matching"
import type {
  FundingAssessment,
  GenerateKind,
  GeneratedDocument,
  PartnerAssessment,
  PersonAssessment,
  ProfileSource,
  RoadmapTask,
  StartupProfile,
  TaskStatus,
  WorkspaceState,
} from "@/lib/types"

const STORAGE_KEY = "uppertune.workspace.v1"

export function docKey(kind: GenerateKind, targetId: string) {
  return `${kind}:${targetId}`
}

function createDemoState(analysedAt: string): WorkspaceState {
  return {
    version: 1,
    mode: "demo",
    profile: demoStartup,
    profileSource: "demo",
    analysedAt,
    analysedUrl: demoStartup.website,
    savedIds: [],
    taskStatus: {},
    documents: {},
    edits: {},
  }
}

function isWorkspaceState(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") return false
  const v = value as Partial<WorkspaceState>
  return v.version === 1 && !!v.profile && typeof v.profile.name === "string"
}

type AnalysisInput = {
  profile: StartupProfile
  profileSource: ProfileSource
  url?: string
  notes?: string[]
}

type WorkspaceContextValue = {
  /** false during SSR and the first client render; render skeletons until true. */
  hydrated: boolean
  state: WorkspaceState
  isDemo: boolean
  loadDemo: () => void
  setAnalysis: (input: AnalysisInput) => void
  updateProfile: (profile: StartupProfile) => void
  isSaved: (id: string) => boolean
  /** Returns the new saved state. */
  toggleSaved: (id: string) => boolean
  getTaskStatus: (task: RoadmapTask) => TaskStatus
  setTaskStatus: (id: string, status: TaskStatus) => void
  getDocument: (kind: GenerateKind, targetId: string) => GeneratedDocument | undefined
  saveDocument: (doc: GeneratedDocument) => void
  getEdit: (kind: GenerateKind, targetId: string) => string | undefined
  /** Pass null to discard the edit and fall back to the generated text. */
  saveEdit: (kind: GenerateKind, targetId: string, text: string | null) => void
  reset: () => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [state, setState] = useState<WorkspaceState>(() => createDemoState(""))

  useEffect(() => {
    let next: WorkspaceState | null = null
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (isWorkspaceState(parsed)) next = parsed
      }
    } catch {
      next = null
    }
    setState(next ?? createDemoState(new Date().toISOString()))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage full or unavailable: keep working in memory.
    }
  }, [state, hydrated])

  const loadDemo = useCallback(() => {
    setState(createDemoState(new Date().toISOString()))
  }, [])

  const setAnalysis = useCallback((input: AnalysisInput) => {
    setState({
      version: 1,
      mode: "live",
      profile: input.profile,
      profileSource: input.profileSource,
      analysedAt: new Date().toISOString(),
      analysedUrl: input.url,
      analysisNotes: input.notes,
      savedIds: [],
      taskStatus: {},
      documents: {},
      edits: {},
    })
  }, [])

  const updateProfile = useCallback((profile: StartupProfile) => {
    // Generated documents were written for the old profile; drop them so they regenerate.
    setState((s) => ({ ...s, profile, documents: {}, edits: {} }))
  }, [])

  const isSaved = useCallback((id: string) => state.savedIds.includes(id), [state.savedIds])

  const toggleSaved = useCallback(
    (id: string) => {
      const willSave = !state.savedIds.includes(id)
      setState((s) => ({
        ...s,
        savedIds: willSave ? [...s.savedIds.filter((x) => x !== id), id] : s.savedIds.filter((x) => x !== id),
      }))
      return willSave
    },
    [state.savedIds],
  )

  const getTaskStatus = useCallback(
    (task: RoadmapTask) => state.taskStatus[task.id] ?? task.defaultStatus,
    [state.taskStatus],
  )

  const setTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setState((s) => ({ ...s, taskStatus: { ...s.taskStatus, [id]: status } }))
  }, [])

  const getDocument = useCallback(
    (kind: GenerateKind, targetId: string) => state.documents[docKey(kind, targetId)],
    [state.documents],
  )

  const saveDocument = useCallback((doc: GeneratedDocument) => {
    setState((s) => {
      const key = docKey(doc.kind, doc.targetId)
      const edits = { ...s.edits }
      delete edits[key]
      return { ...s, documents: { ...s.documents, [key]: doc }, edits }
    })
  }, [])

  const getEdit = useCallback(
    (kind: GenerateKind, targetId: string) => state.edits[docKey(kind, targetId)],
    [state.edits],
  )

  const saveEdit = useCallback((kind: GenerateKind, targetId: string, text: string | null) => {
    setState((s) => {
      const key = docKey(kind, targetId)
      const edits = { ...s.edits }
      if (text === null) delete edits[key]
      else edits[key] = text
      return { ...s, edits }
    })
  }, [])

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setState(createDemoState(new Date().toISOString()))
  }, [])

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      hydrated,
      state,
      isDemo: state.mode === "demo",
      loadDemo,
      setAnalysis,
      updateProfile,
      isSaved,
      toggleSaved,
      getTaskStatus,
      setTaskStatus,
      getDocument,
      saveDocument,
      getEdit,
      saveEdit,
      reset,
    }),
    [
      hydrated,
      state,
      loadDemo,
      setAnalysis,
      updateProfile,
      isSaved,
      toggleSaved,
      getTaskStatus,
      setTaskStatus,
      getDocument,
      saveDocument,
      getEdit,
      saveEdit,
      reset,
    ],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error("useWorkspace must be used inside <WorkspaceProvider>")
  return ctx
}

export type Intelligence = {
  funding: FundingAssessment[]
  partners: PartnerAssessment[]
  people: PersonAssessment[]
  tasks: RoadmapTask[]
}

/** Ranked, assessed opportunities for the current profile (deterministic matching engine). */
export function useIntelligence(): Intelligence {
  const { state } = useWorkspace()
  const isDemo = state.mode === "demo"
  return useMemo(() => {
    const funding = rankFunding(state.profile)
    const partners = rankPartners(state.profile)
    const people = rankPeople(state.profile)
    const tasks = buildActionPlan(state.profile, funding, partners, people, isDemo)
    return { funding, partners, people, tasks }
  }, [state.profile, isDemo])
}
