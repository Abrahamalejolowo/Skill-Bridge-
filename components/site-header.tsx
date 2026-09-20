"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const links = [
    ["Opportunities", "/opportunities"],
    ["How it works", "/how-it-works"],
    ["About", "/about"],
    ["Features", "/features"],
    ["Contact", "/contact"],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
          <span className="text-primary">Skills</span>
          <span className="text-accent">bridge</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={
                active === href
                  ? "font-semibold text-accent"
                  : "text-xs font-semibold text-foreground/80 hover:text-accent"
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition hover:opacity-90"
          >
            Sign up
          </Link>
        </div>
        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
          className="flex size-10 items-center justify-center rounded-lg border border-border md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-5 py-4 md:hidden">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-xs font-medium hover:bg-muted"
            >
              {label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link
              href="/sign-in"
              className="rounded-xl border border-border px-4 py-2.5 text-center text-xs font-semibold"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-xl bg-accent px-4 py-2.5 text-center text-xs font-semibold text-accent-foreground"
            >
              Sign up
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card px-6 py-12 text-xs text-muted-foreground lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-start">
        <div>
          <Link href="/" className="font-serif text-xl font-bold text-primary">
            Skills<span className="text-accent">bridge</span>
          </Link>
          <p className="mt-3 font-serif text-sm font-semibold text-foreground">Skills Bridge</p>
          <p className="mt-1 text-muted-foreground">
            AI-Powered Opportunity Discovery<br />And Readiness For Students.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 font-medium">
          <Link href="/how-it-works" className="hover:text-foreground">How it works</Link>
          <Link href="/opportunities" className="hover:text-foreground">Explore opportunities</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-border pt-6 text-[11px]">
        Built For The Digital Innovation Track.
      </div>
    </footer>
  );
}