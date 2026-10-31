/** Client-safe URL normalisation for the website input ("acme.com" -> "https://acme.com"). */
export function normaliseWebsiteInput(raw: string): { ok: true; url: string } | { ok: false; error: string } {
  const input = raw.trim();
  if (!input) return { ok: false, error: "Enter your startup's website address." };
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(input) ? input : `https://${input.replace(/^\/+/, "")}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return { ok: false, error: "That doesn't look like a valid website address." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Use an http or https website address." };
  }
  if (url.username || url.password) {
    return { ok: false, error: "Remove the username or password from the address." };
  }
  const host = url.hostname;
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[");
  if (!isIp && !/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z][a-z0-9-]{1,62}$/i.test(host)) {
    return { ok: false, error: "Enter a full domain, such as yourstartup.com." };
  }
  url.hash = "";
  const href = url.toString();
  return { ok: true, url: url.pathname === "/" && !url.search ? href.replace(/\/$/, "") : href };
}
