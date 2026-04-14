import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 text-sm">
          <div>
            <h4 className="font-medium text-foreground mb-3">Tools</h4>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <Link href="/tools/dev" className="hover:text-foreground transition-colors">Developer Tools</Link>
              <Link href="/tools/media" className="hover:text-foreground transition-colors">AI Media Tools</Link>
              <Link href="/tools/ai" className="hover:text-foreground transition-colors">AI-Powered Tools</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-3">Popular</h4>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <Link href="/tools/media/face-swap" className="hover:text-foreground transition-colors">AI Face Swap</Link>
              <Link href="/tools/media/image-upscaler" className="hover:text-foreground transition-colors">Image Upscaler</Link>
              <Link href="/tools/media/background-remover" className="hover:text-foreground transition-colors">Background Remover</Link>
              <Link href="/tools/dev/json-formatter" className="hover:text-foreground transition-colors">JSON Formatter</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-3">Product</h4>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/api-docs" className="hover:text-foreground transition-colors">API Documentation</Link>
              <Link href="/llms.txt" className="hover:text-foreground transition-colors">llms.txt</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-3">Legal</h4>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AllKit. Free developer & AI tools.</p>
          <p>All client-side tools process data in your browser. Nothing is uploaded.</p>
        </div>
      </div>
    </footer>
  );
}
