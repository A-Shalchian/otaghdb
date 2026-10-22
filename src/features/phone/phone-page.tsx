import { connection } from "next/server";
import QRCode from "qrcode";
import { APP_PORT, phoneLink } from "@/lib/tailscale";

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded-md bg-card px-1.5 py-0.5 font-mono text-[13px]">{children}</code>;
}

export async function PhonePage() {
  await connection();
  const link = await phoneLink();

  if (link.state === "ready") {
    const svg = await QRCode.toString(link.url, { type: "svg", margin: 1, color: { dark: "#1c1b18", light: "#fbfaf6" } });
    return (
      <div className="grid gap-8 md:grid-cols-[18rem_minmax(0,1fr)]">
        <div
          className="w-72 max-w-full overflow-hidden rounded-2xl border border-line"
          aria-label={`QR code for ${link.url}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="flex flex-col gap-4 text-sm">
          <p>
            Scan this with the phone camera, or open{" "}
            <a href={link.url} className="break-all font-medium underline underline-offset-4">
              {link.url}
            </a>
            .
          </p>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>Install the Tailscale app on the phone and sign in to the same tailnet as this laptop.</li>
            <li>Scan the code. The address only opens for devices on your tailnet; nobody else can reach it.</li>
            <li>Tap Camera on any add screen. The browser asks for camera access the first time.</li>
            <li>Optional: use the browser&apos;s &quot;Add to Home screen&quot; so it opens like an app.</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-3 text-sm">
      {link.state === "missing" ? (
        <p>
          Tailscale is not installed on this laptop. Install it from tailscale.com/download, sign in, then run{" "}
          <Code>.\start.ps1</Code> again.
        </p>
      ) : null}
      {link.state === "logged-out" ? (
        <p>
          Tailscale is installed but not signed in. Run <Code>tailscale up</Code> in a terminal, sign in in the browser
          window it opens, then run <Code>.\start.ps1</Code> again.
        </p>
      ) : null}
      {link.state === "not-served" ? (
        <p>
          Tailscale is on as <Code>{link.host}</Code>, but the app is not shared on it yet. Run <Code>.\start.ps1</Code>,
          or <Code>tailscale serve --bg {APP_PORT}</Code>, then reload this page.
        </p>
      ) : null}
      <p className="text-soft">
        Without Tailscale the phone can still use the laptop&apos;s address on the same wifi, but browsers only allow the
        live camera on HTTPS, so the Camera button falls back to the phone&apos;s camera app.
      </p>
    </div>
  );
}
