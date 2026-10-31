// Server-only: lightweight, SSRF-safe extraction of a single submitted web page.
import { lookup } from "node:dns/promises";
import net from "node:net";
import type { ExtractResponse, ExtractedPage } from "@/lib/types";

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 8_000;
const MAX_BYTES = 1_500_000;
const MAX_TEXT_CHARS = 6_000;
const MAX_HEADINGS = 20;
const USER_AGENT = "Mozilla/5.0 (compatible; UpperTune/0.1; startup profile analysis; single-page fetch)";

class ExtractError extends Error {}

// ---------- URL + address validation ----------

const blockedV4 = new net.BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10], // CGNAT
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // link-local + cloud metadata
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blockedV4.addSubnet(network, prefix, "ipv4");
}

const blockedV6 = new net.BlockList();
for (const [network, prefix] of [
  ["::", 128], // unspecified
  ["::1", 128], // loopback
  ["64:ff9b:1::", 48], // local-use NAT64
  ["100::", 64], // discard
  ["2001:db8::", 32], // documentation
  ["fc00::", 7], // unique local
  ["fe80::", 10], // link-local
  ["fec0::", 10], // deprecated site-local
  ["ff00::", 8], // multicast
] as const) {
  blockedV6.addSubnet(network, prefix, "ipv6");
}

/** Returns the IPv4 address embedded in an IPv6 address (mapped, compatible or NAT64), if any. */
function embeddedIPv4(address: string): string | null {
  const lower = address.toLowerCase();
  const dotted = lower.match(/^(?:::ffff:(?:0:)?|::|64:ff9b::)(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (dotted) return dotted[1];
  const hex = lower.match(/^(?:::ffff:(?:0:)?|64:ff9b::)([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
  }
  return null;
}

export function isBlockedAddress(address: string): boolean {
  const clean = address.replace(/^\[|\]$/g, "").split("%")[0];
  const family = net.isIP(clean);
  if (family === 4) return blockedV4.check(clean, "ipv4");
  if (family === 6) {
    const v4 = embeddedIPv4(clean);
    if (v4 && net.isIPv4(v4)) return blockedV4.check(v4, "ipv4");
    return blockedV6.check(clean, "ipv6");
  }
  return true;
}

const BLOCKED_HOST_SUFFIXES = [".localhost", ".local", ".internal", ".localdomain", ".home.arpa", ".lan"];

/** Normalises user input ("acme.com" -> "https://acme.com/") and validates scheme and credentials. */
export function normaliseUrl(raw: string): URL {
  const input = raw.trim();
  if (!input) throw new ExtractError("Please enter a website address.");
  if (input.length > 2048) throw new ExtractError("That website address is too long.");
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(input) ? input : `https://${input.replace(/^\/+/, "")}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new ExtractError("That doesn't look like a valid website address.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ExtractError("Only http and https websites can be analysed.");
  }
  if (url.username || url.password) {
    throw new ExtractError("Website addresses containing a username or password are not supported.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host) throw new ExtractError("That doesn't look like a valid website address.");
  if (host === "localhost" || BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    throw new ExtractError("This address points to a local or private network, which UpperTune does not access.");
  }
  if (net.isIP(host) === 0 && !host.includes(".")) {
    throw new ExtractError("Please enter a full public domain, such as yourstartup.com.");
  }
  url.hash = "";
  return url;
}

async function assertPublicHost(url: URL): Promise<void> {
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase().replace(/\.$/, "");
  const privateMessage = "This address points to a local or private network, which UpperTune does not access.";
  if (host === "localhost" || BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    throw new ExtractError(privateMessage);
  }
  if (net.isIP(host)) {
    if (isBlockedAddress(host)) throw new ExtractError(privateMessage);
    return;
  }
  let addresses: { address: string; family: number }[];
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new ExtractError("We couldn't find a website at this address. Check the domain for typos.");
  }
  if (addresses.length === 0) {
    throw new ExtractError("We couldn't find a website at this address. Check the domain for typos.");
  }
  if (addresses.some((entry) => isBlockedAddress(entry.address))) {
    throw new ExtractError(privateMessage);
  }
}

// ---------- Fetching ----------

async function readCapped(response: Response): Promise<Uint8Array> {
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  if (total >= MAX_BYTES) await reader.cancel().catch(() => undefined);
  const out = new Uint8Array(Math.min(total, MAX_BYTES));
  let offset = 0;
  for (const chunk of chunks) {
    const slice = chunk.subarray(0, Math.min(chunk.byteLength, out.byteLength - offset));
    out.set(slice, offset);
    offset += slice.byteLength;
    if (offset >= out.byteLength) break;
  }
  return out;
}

function decodeBody(bytes: Uint8Array, contentType: string): string {
  const charset = contentType.match(/charset=["']?([\w-]+)/i)?.[1];
  try {
    return new TextDecoder(charset || "utf-8").decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

async function fetchHtml(start: URL, signal: AbortSignal): Promise<{ url: string; html: string }> {
  let current = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHost(current);
    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal,
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
          "accept-language": "en;q=0.9,*;q=0.5",
        },
      });
    } catch (err) {
      if (signal.aborted) throw err;
      throw new ExtractError("We couldn't connect to the website. It may be offline or blocking automated requests.");
    }

    if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
      await response.body?.cancel().catch(() => undefined);
      if (hop === MAX_REDIRECTS) throw new ExtractError("The website redirected too many times.");
      let next: URL;
      try {
        next = new URL(response.headers.get("location")!, current);
      } catch {
        throw new ExtractError("The website redirected to an invalid address.");
      }
      if (next.protocol !== "http:" && next.protocol !== "https:") {
        throw new ExtractError("The website redirected to an unsupported address.");
      }
      if (next.username || next.password) {
        throw new ExtractError("The website redirected to an address with embedded credentials.");
      }
      current = next;
      continue;
    }

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      if (response.status === 401 || response.status === 403) {
        throw new ExtractError(`The website blocked automated access (HTTP ${response.status}).`);
      }
      if (response.status === 404) throw new ExtractError("The page was not found (HTTP 404).");
      throw new ExtractError(`The website responded with an error (HTTP ${response.status}).`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isHtml = /text\/html|application\/xhtml\+xml/i.test(contentType);
    if (contentType && !isHtml) {
      await response.body?.cancel().catch(() => undefined);
      const type = contentType.split(";")[0].trim();
      throw new ExtractError(`This address returned ${type} content rather than a web page.`);
    }
    const html = decodeBody(await readCapped(response), contentType);
    if (!contentType && !/<(html|body|title|head)[\s>]/i.test(html)) {
      throw new ExtractError("This address did not return a web page.");
    }
    return { url: current.toString(), html };
  }
  throw new ExtractError("The website redirected too many times.");
}

// ---------- HTML extraction ----------

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  laquo: "«",
  raquo: "»",
  middot: "·",
  bull: "•",
  copy: "©",
  reg: "®",
  trade: "™",
  times: "×",
  deg: "°",
  euro: "€",
  pound: "£",
  yen: "¥",
  cent: "¢",
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#\d{1,7}|#x[0-9a-f]{1,6}|[a-z][a-z0-9]{1,8});/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code = entity[1] === "x" || entity[1] === "X" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return " ";
      try {
        return String.fromCodePoint(code);
      } catch {
        return " ";
      }
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

const collapse = (text: string) => text.replace(/\s+/g, " ").trim();

function htmlToText(fragment: string): string {
  return collapse(
    decodeEntities(
      fragment
        .replace(/<(br|hr)\b[^>]*>/gi, " \n")
        .replace(/<\/(p|div|li|h[1-6]|section|article|tr|td|th|dd|dt|blockquote|figcaption|main)>/gi, " \n")
        .replace(/<[^>]+>/g, " "),
    ),
  );
}

function stripBlocks(html: string, tags: string[]): string {
  let out = html;
  for (const tag of tags) {
    out = out.replace(new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), " ");
    out = out.replace(new RegExp(`<${tag}\\b[^>]*\\/>`, "gi"), " ");
  }
  return out;
}

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(tag))) {
    attrs[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? "";
  }
  return attrs;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.8 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function extractFromHtml(html: string, url: string): ExtractedPage {
  const withoutComments = html.replace(/<!--[\s\S]*?-->/g, " ");
  const cleaned = stripBlocks(withoutComments, ["script", "style", "noscript", "svg", "template", "iframe", "canvas"]);

  const meta: Record<string, string> = {};
  for (const tag of cleaned.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = parseAttributes(tag);
    const key = (attrs.name || attrs.property || "").toLowerCase();
    if (key && attrs.content && !meta[key]) meta[key] = collapse(decodeEntities(attrs.content));
  }

  const rawTitle = cleaned.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const title = truncate(collapse(decodeEntities(rawTitle.replace(/<[^>]+>/g, " "))) || meta["og:title"] || "", 300);
  const description = truncate(meta["description"] || meta["og:description"] || meta["twitter:description"] || "", 600);

  const headings: string[] = [];
  const seen = new Set<string>();
  const headingRe = /<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(cleaned)) && headings.length < MAX_HEADINGS) {
    const text = htmlToText(match[2]);
    const key = text.toLowerCase();
    if (text.length < 2 || text.length > 200 || seen.has(key)) continue;
    seen.add(key);
    headings.push(text);
  }

  const bodyHtml = cleaned.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? cleaned.replace(/<head\b[\s\S]*?<\/head>/i, " ");
  let text = htmlToText(stripBlocks(bodyHtml, ["nav", "footer", "header", "form", "select", "button"]));
  if (text.length < 200) {
    // Some sites place their main content inside <header>; fall back to the less aggressive cleanup.
    const fallback = htmlToText(bodyHtml);
    if (fallback.length > text.length) text = fallback;
  }

  return {
    url,
    title,
    description,
    headings,
    text: truncate(text, MAX_TEXT_CHARS),
  };
}

// ---------- Public API ----------

export async function extractWebsite(rawUrl: string): Promise<ExtractResponse> {
  let url: URL;
  try {
    url = normaliseUrl(rawUrl);
  } catch (err) {
    return { ok: false, reason: err instanceof ExtractError ? err.message : "That doesn't look like a valid website address." };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const { url: finalUrl, html } = await fetchHtml(url, controller.signal);
    const page = extractFromHtml(html, finalUrl);
    if (page.text.length + page.description.length < 60) {
      return {
        ok: false,
        reason:
          "The page loaded but contained almost no readable text. It may rely on JavaScript to render its content.",
      };
    }
    return { ok: true, page };
  } catch (err) {
    if (controller.signal.aborted) {
      return { ok: false, reason: `The website took too long to respond (over ${TIMEOUT_MS / 1000} seconds).` };
    }
    if (err instanceof ExtractError) return { ok: false, reason: err.message };
    return { ok: false, reason: "We couldn't read this website. It may be offline or blocking automated requests." };
  } finally {
    clearTimeout(timer);
  }
}
