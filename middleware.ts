const locales = ["fa", "en"]
const defaultLocale = "fa"

function setUrl(req: any, value: string): void {
    try {
        ;(req as any).url = value
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

    // Ignore internal/build routes
    if (
        pathname.startsWith("/__") ||
        pathname.startsWith("/_next") ||
        pathname.includes(".")
    ) {
        return
    }

    const parts = pathname.split("/").filter(Boolean)
    const firstPart = parts[0]

    // 1. If URL starts with default locale (/fa), redirect to clean URL
    if (firstPart === defaultLocale) {
        const cleanPath = pathname.replace(`/${defaultLocale}`, "") || "/"
        const targetUrl = `${cleanPath}${url.search}`

        // ALWAYS use setUrl first
        setUrl(req, targetUrl)

        // then redirect response
        if (typeof res.redirect === "function") {
            return res.redirect(302, targetUrl)
        }

        res.statusCode = 302
        res.setHeader("Location", targetUrl)
        res.end()
        return
    }

    // 2. If another locale exists (/en), leave as-is (but still normalize via setUrl)
    if (locales.includes(firstPart)) {
        setUrl(req, `${pathname}${url.search}`)
        return
    }

    // 3. Internal rewrite -> inject default locale
    const rewrittenPath =
        `/${defaultLocale}` + (pathname === "/" ? "" : pathname)

    setUrl(req, `${rewrittenPath}${url.search}`)
}