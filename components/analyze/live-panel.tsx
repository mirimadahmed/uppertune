"use client";

import { useEffect, useState } from "react";
import { useCountTo } from "@/components/analyze/stage-list";
import { cn } from "@/lib/utils";
import type { StartupProfile } from "@/lib/types";
import styles from "./analyze.module.css";

export type LiveSource = { label: string; note: string; title?: string };

export type LiveData = {
  source?: LiveSource;
  profile?: StartupProfile;
  model?: string;
  funding?: { relevant: number; reviewed: number };
  partners?: number;
  people?: number;
  actions?: number;
};

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-background/50">{children}</p>;
}

function Bar({ className, active }: { className?: string; active?: boolean }) {
  return <span className={cn("block h-3 text-background", styles.placeholder, active && styles.shimmer, className)} />;
}

function Field({ label, delay, children }: { label: string; delay: number; children: React.ReactNode }) {
  return (
    <div className={styles.reveal} style={{ animationDelay: `${delay}ms` }}>
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-background/45">{label}</dt>
      <dd className="mt-1.5 line-clamp-2 text-sm leading-snug text-background/90">{children}</dd>
    </div>
  );
}

function Count({ value, label, hint, active }: { value?: number; label: string; hint: string; active: boolean }) {
  const shown = useCountTo(value ?? 0, 900);
  return (
    <div className="px-4 py-[clamp(1rem,2.6vh,1.75rem)] sm:px-6">
      <p className="font-display text-[clamp(2.25rem,5vh,3.5rem)] leading-none tabular-nums">
        {value === undefined ? <span className={cn("text-background/25", active && "animate-pulse")}>—</span> : shown}
      </p>
      <p className="mt-2 text-[13px] leading-snug text-background/80">{label}</p>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-background/45">{hint}</p>
    </div>
  );
}

export function LivePanel({ data, activeStage }: { data: LiveData; activeStage?: string }) {
  const { source, profile } = data;
  const profileActive = activeStage === "profile";
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-[clamp(1.25rem,3.4vh,2.5rem)] px-6 py-[clamp(1.25rem,3.6vh,2.75rem)] sm:px-10">
        <section>
          <Label>01 · Source</Label>
          {source ? (
            <div className={cn("mt-2.5", styles.reveal)}>
              <p className="truncate text-lg text-background">
                {source.label}
                {source.title ? <span className="text-background/55"> — {source.title}</span> : null}
              </p>
              <p className="mt-1 font-mono text-xs text-background/55">{source.note}</p>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <Bar active={activeStage === "understand"} className="w-2/3" />
              <Bar active={activeStage === "understand"} className="h-2 w-1/3" />
            </div>
          )}
        </section>
        <section>
          <Label>02 · Company profile{data.model ? ` · ${data.model}` : ""}</Label>
          {profile ? (
            <div className="mt-3">
              <h2 aria-label={profile.name} className="font-display text-[clamp(2.4rem,5.4vh,3.75rem)] leading-none tracking-tight">
                {profile.name.split("").map((char, i) => (
                  <span key={i} aria-hidden className="inline-block animate-char-in" style={{ animationDelay: `${i * 40}ms` }}>
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h2>
              <p className={cn("mt-3 line-clamp-3 text-[15px] leading-relaxed text-background/70", styles.reveal)} style={{ animationDelay: "250ms" }}>
                {profile.description}
              </p>
              {profile.industry.length ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {profile.industry.slice(0, 5).map((item, i) => (
                    <span
                      key={item}
                      className={cn("border border-background/30 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-background/90", styles.reveal)}
                      style={{ animationDelay: `${400 + i * 80}ms` }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
              <dl className="mt-[clamp(1rem,2.6vh,1.75rem)] grid grid-cols-2 gap-x-8 gap-y-[clamp(0.75rem,2vh,1.25rem)] border-t border-background/15 pt-[clamp(1rem,2.6vh,1.75rem)]">
                <Field label="Markets" delay={600}>
                  {profile.targetMarkets.length ? profile.targetMarkets.join(", ") : "Not stated"}
                </Field>
                <Field label="Stage" delay={680}>{profile.stage ?? "Stage not stated"}</Field>
                <Field label="Core capabilities" delay={760}>
                  {profile.capabilities.length ? profile.capabilities.slice(0, 4).join(", ") : "Not stated"}
                </Field>
                <Field label="Missing information" delay={840}>
                  {profile.missingInformation.length === 0
                    ? "None flagged"
                    : `${profile.missingInformation.length} item${profile.missingInformation.length === 1 ? "" : "s"} to add`}
                </Field>
              </dl>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <Bar active={profileActive} className="h-10 w-1/2" />
              <Bar active={profileActive} className="w-full" />
              <Bar active={profileActive} className="w-11/12" />
              <Bar active={profileActive} className="w-2/3" />
              <div className="flex gap-1.5 pt-1">
                <Bar active={profileActive} className="h-6 w-20" />
                <Bar active={profileActive} className="h-6 w-24" />
                <Bar active={profileActive} className="h-6 w-16" />
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-background/15 pt-5">
                {["Markets", "Stage", "Core capabilities", "Missing information"].map((label) => (
                  <div key={label}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-background/40">{label}</p>
                    <Bar active={profileActive} className="mt-2 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
      <div className="grid grid-cols-4 divide-x divide-background/15 border-t border-background/15">
        <Count
          value={data.funding?.relevant}
          label="Relevant funding"
          hint={data.funding ? `of ${data.funding.reviewed} reviewed` : "programmes"}
          active={activeStage === "evaluate"}
        />
        <Count value={data.partners} label="Partnerships" hint="potential + published" active={activeStage === "evaluate"} />
        <Count value={data.people} label="People" hint="to connect with" active={activeStage === "evaluate"} />
        <Count value={data.actions} label="Next actions" hint="in your roadmap" active={activeStage === "roadmap"} />
      </div>
    </div>
  );
}

export function PanelProblem({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-1 flex-col justify-center px-6 py-10 sm:px-10", styles.reveal)}>
      <span className="flex size-10 items-center justify-center border border-background/30 text-background">{icon}</span>
      <h2 className="mt-6 font-display text-[clamp(2rem,4.4vh,3rem)] leading-[1.05] tracking-tight">{title}</h2>
      {children}
    </div>
  );
}

const HOW = [
  { title: "Understanding your startup", text: "Analysing your website content." },
  { title: "Building your company profile", text: "Gemma 4 extracts your products, capabilities, markets and industries." },
  { title: "Evaluating relevant opportunities", text: "Comparing your startup against programmes, corporate partners and people." },
  { title: "Preparing your growth roadmap", text: "Preparing your personalised recommendations." },
];

export function HowItWorksPanel() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % HOW.length), 4000);
    return () => clearInterval(id);
  }, []);
  return (
    <ol className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10">
      {HOW.map((step, index) => (
        <li key={step.title}>
          <button
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "w-full border-b border-background/15 py-[clamp(1rem,2.8vh,1.75rem)] text-left transition-opacity duration-500",
              active === index ? "opacity-100" : "opacity-45 hover:opacity-70",
            )}
          >
            <div className="flex items-start gap-6">
              <span className="font-display text-3xl leading-none text-background/45">{String(index + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <h3 className="font-display text-[clamp(1.4rem,3vh,2rem)] leading-tight">{step.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-background/70">{step.text}</p>
                {active === index ? (
                  <div className="mt-4 h-px overflow-hidden bg-background/20">
                    <div key={active} className="progress-line h-full bg-background" style={{ "--progress-duration": "4s" } as React.CSSProperties} />
                  </div>
                ) : null}
              </div>
            </div>
          </button>
        </li>
      ))}
    </ol>
  );
}
