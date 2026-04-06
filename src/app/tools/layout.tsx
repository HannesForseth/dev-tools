import { ToolSidebar } from "@/components/tools/tool-sidebar";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <ToolSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
