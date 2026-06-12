const locales = ["fa", "en"]
const defaultLocale = "fa"

function setUrl(req: any, value: string): void {
    try {
        (req as any).url = value
    } catch {
        Object.defineProperty(req, "url", {
            value,
            writable: true,
            configurable: true,
            enumerable: true,
        })
    }
}

export default async function middleware(req: any, res: any) {
    if (!req.url) return

    const url = new URL(req.url, "http://localhost")
    const pathname = url.pathname

    // Ignore internal routes, static assets, or next/vite builds
    if (pathname.startsWith("/__") || pathname.includes(".") || pathname.startsWith("/_next")) {
        return
    }

    const parts = pathname.split("/").filter(Boolean)
    const firstPart = parts[0]

    // 1. EXTERNAL REDIRECT: If browser URL has /fa, force it to drop it
    if (firstPart === defaultLocale) {
        const cleanPathname = pathname.replace(`/${defaultLocale}`, "") || "/"
        const targetUrl = `${cleanPathname}${url.search}`

        // If your framework has res.redirect (Express/Vercel Node)
        if (typeof res.redirect === "function") {
            return res.redirect(302, targetUrl)
        } 
        
        // Fallback for raw Node http.ServerResponse
        res.statusCode = 302
        res.setHeader("Location", targetUrl)
        res.end()
        return
    }

    // 2. LEAVE OTHER LOCALES ALONE: If it's /en, let it pass through
    if (locales.includes(firstPart)) {
        return
    }

    // 3. INTERNAL REWRITE: For clean URLs (like /dashboard), 
    // tell your app code under-the-hood that it's actually the default locale
    const rewrittenPath = `/${defaultLocale}${pathname === "/" ? "" : pathname}`
    setUrl(req, `${rewrittenPath}${url.search}`)
}