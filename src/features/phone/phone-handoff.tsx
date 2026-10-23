import Link from "next/link";
import { connection } from "next/server";
import QRCode from "qrcode";
import { phoneLink } from "@/lib/tailscale";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4">
      <path d="M6 2.5h8v15H6zM9 14.5h2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneHandoffButton() {
  return (
    <span className="flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm max-sm:hidden">
      <PhoneIcon />
      Use your phone
    </span>
  );
}

export async function PhoneHandoff({ path, task }: { path: string; task: string }) {
  await connection();
  const link = await phoneLink();
  const url = link.state === "ready" ? `https://${link.host}${path}` : null;
  const svg = url
    ? await QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#18212c", light: "#f6f8fa" } })
    : null;

  return (
    <details className="group relative max-sm:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm hover:border-accent group-open:border-accent [&::-webkit-details-marker]:hidden">
        <PhoneIcon />
        Use your phone
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-line bg-card p-4 shadow-xl">
        {svg && url ? (
          <>
            <div
              className="overflow-hidden rounded-xl border border-line"
              aria-label={`QR code for ${url}`}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <p className="mt-3 text-sm">Scan this with your phone camera to {task} on the phone.</p>
            <p className="mt-1 text-xs text-soft">
              The phone needs the Tailscale app, signed in to the same account as this laptop. New things show up here
              after a refresh.
            </p>
          </>
        ) : (
          <p className="text-sm">
            Phone access is not set up yet.{" "}
            <Link href="/app/phone" className="font-medium underline underline-offset-4">
              Connect a phone
            </Link>
          </p>
        )}
      </div>
    </details>
  );
}
