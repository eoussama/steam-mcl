import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";



const STEAM_IMAGE_HOSTS = [
  "https://*.steamstatic.com",
  "https://steamcdn-a.akamaihd.net",
];

function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  return btoa(String.fromCharCode(...bytes));
}

function buildContentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    `img-src 'self' data: ${STEAM_IMAGE_HOSTS.join(" ")}`,
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

const securityHeaders = createMiddleware().server(async ({ next }) => {
  const nonce = createNonce();
  const result = await next({ context: { nonce } });
  const headers = result.response.headers;

  // Vite injects un-nonced inline scripts during development, so the policy only applies to production builds.
  if (import.meta.env.PROD) {
    headers.set("content-security-policy", buildContentSecurityPolicy(nonce));
  }

  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("cross-origin-opener-policy", "same-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");

  return result;
});

const csrf = createCsrfMiddleware({
  filter: context => context.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrf, securityHeaders],
}));

// Types the request context (the CSP nonce) for `getGlobalStartContext`. The route tree generator is meant to emit
// this registration but currently omits it.
declare module "@tanstack/react-start" {
  interface Register {
    config: Awaited<ReturnType<typeof startInstance.getOptions>>;
  }
}
