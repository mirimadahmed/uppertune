"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normaliseWebsiteInput } from "@/components/landing/normalise-url";
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
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-foreground">
        Enter your startup website
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Globe className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
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
            className="h-12 rounded-xl border-border bg-card pl-10 text-[15px] shadow-none"
          />
        </div>
        <Button type="submit" size="lg" disabled={submitting} className="h-12 rounded-xl px-5 text-[15px]">
          Analyse my startup
          <ArrowRight className="size-4" />
        </Button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button asChild variant="outline" size="sm" className="rounded-full bg-card px-4">
          <Link href="/analyze?demo=1">Explore demo</Link>
        </Button>
        {showCaption ? (
          <p className="text-sm text-muted-foreground">
            UpperTune analyses your business and maps opportunities that fit your startup.
          </p>
        ) : null}
      </div>
    </form>
  );
}
