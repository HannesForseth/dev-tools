"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X, Wrench } from "lucide-react";

export function Header() {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Wrench className="h-5 w-5 text-primary" />
          <span>AllKit</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/tools/dev" className="text-muted-foreground hover:text-foreground transition-colors">
            Developer
          </Link>
          <Link href="/tools/media" className="text-muted-foreground hover:text-foreground transition-colors">
            Media
          </Link>
          <Link href="/tools/ai" className="text-muted-foreground hover:text-foreground transition-colors">
            AI Tools
          </Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border px-4 py-3 flex flex-col gap-2 text-sm bg-background">
          <Link href="/tools/dev" className="py-2 text-muted-foreground hover:text-foreground" onClick={() => setMenuOpen(false)}>
            Developer Tools
          </Link>
          <Link href="/tools/media" className="py-2 text-muted-foreground hover:text-foreground" onClick={() => setMenuOpen(false)}>
            Media Tools
          </Link>
          <Link href="/tools/ai" className="py-2 text-muted-foreground hover:text-foreground" onClick={() => setMenuOpen(false)}>
            AI Tools
          </Link>
        </nav>
      )}
    </header>
  );
}
