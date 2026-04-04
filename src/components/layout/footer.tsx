import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DevTools. Free developer & AI tools.</p>
          <div className="flex gap-6">
            <Link href="/tools/dev" className="hover:text-foreground transition-colors">Developer</Link>
            <Link href="/tools/media" className="hover:text-foreground transition-colors">Media</Link>
            <Link href="/tools/ai" className="hover:text-foreground transition-colors">AI Tools</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
