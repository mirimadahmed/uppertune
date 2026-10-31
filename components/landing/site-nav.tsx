"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Wordmark } from "@/components/landing/logo";
import { ctaSize, outlineCta, primaryCta } from "@/components/landing/cta-styles";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Product", href: "#product" },
  { name: "How it works", href: "#how-it-works" },
  { name: "ASEAN ecosystem", href: "#ecosystem" },
];

export function SiteNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={cn("fixed z-50 transition-all duration-500", isScrolled ? "left-4 right-4 top-4" : "left-0 right-0 top-0")}
    >
      <nav
        aria-label="Main"
        className={cn(
          "relative z-50 mx-auto border transition-all duration-500",
          isScrolled || open
            ? "max-w-[1200px] rounded-sm border-foreground/10 bg-background/80 backdrop-blur-xl"
            : "max-w-[1400px] border-transparent bg-transparent",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between px-6 transition-all duration-500 lg:px-8",
            isScrolled ? "h-14" : "h-20",
          )}
        >
          <Wordmark compact={isScrolled} />

          <div className="hidden items-center gap-12 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="group relative text-sm text-foreground/70 transition-colors duration-300 hover:text-foreground"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden items-center md:flex">
            <Link
              href="/analyze?demo=1"
              className={cn(primaryCta, "transition-all duration-500", isScrolled ? "h-8 px-4 text-xs" : "h-9 px-6 text-sm")}
            >
              Try the demo
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="p-2 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-background transition-all duration-500 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col px-8 pb-8 pt-28">
          <div className="flex flex-1 flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className={cn(
                  "font-display text-5xl text-foreground transition-all duration-500 hover:text-muted-foreground",
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
                style={{ transitionDelay: open ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
              </a>
            ))}
          </div>
          <div
            className={cn(
              "flex gap-4 border-t border-foreground/10 pt-8 transition-all duration-500",
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
            style={{ transitionDelay: open ? "300ms" : "0ms" }}
          >
            <a href="#top" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} className={cn(outlineCta, ctaSize.lg, "flex-1 px-4")}>
              Analyse
            </a>
            <Link href="/analyze?demo=1" tabIndex={open ? 0 : -1} className={cn(primaryCta, ctaSize.lg, "flex-1 px-4")}>
              Try the demo
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
