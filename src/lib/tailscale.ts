import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

export const APP_PORT = 3100;

export type PhoneLink =
  | { state: "ready"; url: string; host: string }
  | { state: "not-served"; host: string }
  | { state: "logged-out" }
  | { state: "missing" };

async function tailscaleJson(args: string[]) {
  const { stdout } = await run("tailscale", args, { timeout: 4000, windowsHide: true });
  return JSON.parse(stdout || "{}");
}

type ServeStatus = { Web?: Record<string, { Handlers?: Record<string, { Proxy?: string }> }> };

export async function phoneLink(): Promise<PhoneLink> {
  let status: { BackendState?: string; Self?: { DNSName?: string } };
  try {
    status = await tailscaleJson(["status", "--json"]);
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "ENOENT" ? { state: "missing" } : { state: "logged-out" };
  }
  const host = status.Self?.DNSName?.replace(/\.$/, "");
  if (status.BackendState !== "Running" || !host) return { state: "logged-out" };

  try {
    const serve = (await tailscaleJson(["serve", "status", "--json"])) as ServeStatus;
    const proxies = Object.values(serve.Web ?? {}).flatMap((site) =>
      Object.values(site.Handlers ?? {}).map((handler) => handler.Proxy ?? ""),
    );
    if (proxies.some((proxy) => proxy.endsWith(`:${APP_PORT}`))) {
      return { state: "ready", url: `https://${host}/app`, host };
    }
  } catch {
    // No serve config yet reads the same as not served.
  }
  return { state: "not-served", host };
}
