import Link from "next/link";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/app" className="font-mono text-sm tracking-tight">
            OtaghDB
          </Link>
          <Link
            href="/app/add"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-85"
          >
            Add item
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </>
  );
}
