import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Sales Coach | AI-Powered Call Intelligence",
  description: "Transform your sales team with AI-powered call analysis and coaching",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased grain-overlay">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="bg-background">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 px-6 bg-background/80 backdrop-blur-sm border-b border-border/50">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
              <div className="h-4 w-px bg-border" />
              <nav className="flex items-center text-sm">
                <span className="text-muted-foreground">Dashboard</span>
              </nav>
            </header>
            <main className="flex-1 p-8 relative z-10">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
