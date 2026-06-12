const locales = ["fa", "en"]

function setUrl(req: any, value: string): void {
    try {
        // Fast path — works on plain Node http.IncomingMessage (local/Node build).
        (req as any).url = value
    } catch {
        // Fallback — req.url is a getter-only accessor (Vercel).
        Object.defineProperty(req, "url", {
            value,
            writable: true,
            configurable: true,
            enumerable: true,
        })
    }
}

export default async function middleware(
    req: any,
    _res: any,
) {
    if (!req.url) return

    const url = new URL(req.url, "http://localhost")
    const pathname = url.pathname

    if (pathname === "/fa" || pathname === "/fa/") {
        _res.writeHead(302, {
            Location: "/",
        });
        _res.end();
        return;
    }

    // Ignore internal routes starting with __
    if (pathname.startsWith("/__")) {
        return
    }

    const parts = pathname.split("/").filter(Boolean)

    // Already has locale
    if (locales.includes(parts[0])) {
        return
    }

    // /login -> /en/login
    // /dashboard -> /en/dashboard

    setUrl(req, `/${"fa"}${pathname === "/" ? "" : pathname}${url.search}`)

    // req.url = `/${"fa"}${pathname === "/" ? "" : pathname}${url.search}`

    console.log("middleware end")
}