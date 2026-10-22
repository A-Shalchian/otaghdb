import Link from "next/link";

const NAV = [
  { href: "/app", label: "Everything" },
  { href: "/app/closet", label: "Closet" },
  { href: "/app/ask", label: "Ask" },
  { href: "/app/check", label: "Do I own this?" },
  { href: "/app/lists", label: "Lists" },
  { href: "/app/phone", label: "Phone" },
];

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/app" className="shrink-0 font-mono text-sm tracking-tight">
              OtaghDB
            </Link>
            <nav className="-my-2 flex min-w-0 gap-4 overflow-x-auto py-2 text-sm text-soft">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="shrink-0 hover:text-ink">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/app/add"
            className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-85"
          >
            Add
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </>
  );
}
