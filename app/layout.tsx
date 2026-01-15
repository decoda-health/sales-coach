import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sales Coach",
  description: "AI-powered sales coaching with call analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-gray-100 p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-8">Sales Coach</h1>
      <nav className="flex flex-col gap-2">
        <a
          href="/"
          className="px-3 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Dashboard
        </a>
        <a
          href="/reps"
          className="px-3 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Reps
        </a>
      </nav>
      <div className="mt-auto text-xs text-gray-500">v0.1.0</div>
    </aside>
  );
}
