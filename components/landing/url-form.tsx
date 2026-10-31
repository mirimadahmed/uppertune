"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe } from "lucide-react";
import { normaliseWebsiteInput } from "@/components/landing/normalise-url";
import { ctaSize, outlineCta, primaryCta } from "@/components/landing/cta-styles";
import { cn } from "@/lib/utils";

export function UrlForm({
  className,
  defaultValue = "",
  showCaption = true,
  autoFocus = false,
}: {
  className?: string;
  defaultValue?: string;
  showCaption?: boolean;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = normaliseWebsiteInput(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setSubmitting(true);
    router.push(`/analyze?url=${encodeURIComponent(result.url)}`);
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn("w-full", className)}>
      <label htmlFor={inputId} className="mb-3 block font-mono text-sm text-muted-foreground">
        Enter your startup website
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Globe className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id={inputId}
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            autoFocus={autoFocus}
            placeholder="https://yourstartup.com"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="h-14 w-full rounded-none border border-foreground/20 bg-background pl-11 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-foreground/40 focus-visible:border-primary aria-invalid:border-danger"
          />
        </div>
        <button type="submit" disabled={submitting} className={cn(primaryCta, ctaSize.lg)}>
          Analyse my startup
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 font-mono text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Link href="/analyze?demo=1" className={cn(outlineCta, ctaSize.lg, "mt-3 flex w-full")}>
        Explore demo
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
      {showCaption ? (
        <p className="mt-4 text-sm text-muted-foreground">
          UpperTune analyses your business and maps opportunities that fit your startup.
        </p>
      ) : null}
    </form>
  );
}
