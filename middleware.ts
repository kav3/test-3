const locales = ["fa", "en"]
const defaultLocale = "fa"

/**
 * Utility to safely overwrite only the pathname of a request, 
 * automatically preserving any existing query parameters.
 */
function setPathname(req: any, newPathname: string): void {
    if (!req.url) return

    try {
        const url = new URL(req.url, "http://localhost")
        url.pathname = newPathname.startsWith("/") ? newPathname : `/${newPathname}`

            // Fast path
            (req as any).url = `${url.pathname}${url.search}`
    } catch {
        // Fallback
        const url = new URL(req.url, "http://localhost")
        url.pathname = newPathname.startsWith("/") ? newPathname : `/${newPathname}`
        const newValue = `${url.pathname}${url.search}`

        Object.defineProperty(req, "url", {
            value: newValue,
            writable: true,
            configurable: true,
            enumerable: true,
        })
    }
}

export default async function middleware(
    req: any,
    res: any,
) {
    if (!req.url) return

    const url = new URL(req.url, "http://localhost")
    const pathname = url.pathname

    // 1. Skip internal framework routes and static files (images, css, js)
    if (
        pathname.startsWith("/__") ||
        pathname.startsWith("/_next") ||
        pathname.includes(".")
    ) {
        return
    }

    const parts = pathname.split("/").filter(Boolean)
    const firstPart = parts[0]

    // 2. EXTERNAL REDIRECT: If user visits /fa/dashboard, strip /fa and redirect to /dashboard
    if (firstPart === defaultLocale) {
        const cleanPathname = pathname.replace(`/${defaultLocale}`, "") || "/"
        const targetUrl = `${cleanPathname}${url.search}`

        // Try framework-specific redirect (Express/Vercel/Next)
        if (typeof res.redirect === "function") {
            return res.redirect(302, targetUrl)
        }

        // Native Node.js fallback redirect
        res.statusCode = 302
        res.setHeader("Location", targetUrl)
        res.end()
        return
    }

    // 3. PASSTHROUGH: If it's a non-default locale (like /en), leave it alone
    if (locales.includes(firstPart)) {
        return
    }

    // 4. INTERNAL REWRITE: For clean URLs (e.g., /dashboard), 
    // silently prepend /fa behind the scenes so the application knows the locale context.
    const rewrittenPathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`

    setPathname(req, rewrittenPathname)
}