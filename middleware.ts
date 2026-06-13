const locales = ["fa", "en"]

/**
 * Sets the URL property on the request object for compatibility across different environments (Node vs Vercel).
 */
function setUrl(req: any, value: string): void {
    try {
        // Fast path — works on plain Node http.IncomingMessage (local/Node build).
        (req as any).url = value
    } catch (e) {
        // Fallback for getter-only accessors (Vercel).
        Object.defineProperty(req, "url", {
            value,
            writable: true,
            configurable: true,
            enumerable: true,
        })
    }
}

export default async function middleware(req: any, _res: any) {
    if (!req.url) return

    const url = new URL(req.url, "http://localhost")
    let pathname = url.pathname

    // 1. Ignore internal routes starting with __
    if (pathname.startsWith("/__")) {
        return
    }

    // 2. Redirect /fa or /fa/* to root path /
    if (pathname === "/fa" || pathname.startsWith("/fa/")) {
        try {
            _res.statusCode = 302
            _res.setHeader("Location", "/")
            _res.end()
            return
        } catch (error) {
            // Fallback for environments where _res.end() fails
            return new Response(null, { status: 302, headers: { Location: "/" } })
        }
    }

    const parts = pathname.split("/").filter(Boolean)

    // 3. Already has locale prefix (e.g., /en/dashboard)
    if (locales.includes(parts[0])) {
        return
    }

    // 4. Prepend default locale ('fa') to the path if not already present.
    // This handles cases like /login -> /fa/login and /dashboard -> /fa/dashboard
    const newPath = `/${"fa"}${pathname === "/" ? "" : pathname}${url.search}`

    setUrl(req, newPath)

}