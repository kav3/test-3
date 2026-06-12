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

export default async function middleware(req: any, _res: any) {
    if (!req.url) return

    const url = new URL(req.url, "http://localhost")
    const pathname = url.pathname

    // Ignore internal or asset routes
    if (pathname.startsWith("/__") || pathname.includes(".")) {
        return
    }

    const parts = pathname.split("/").filter(Boolean)
    const firstPart = parts[0]

    // 1. If user explicitly types /fa, redirect/rewrite to the clean version (/)
    if (firstPart === defaultLocale) {
        const newPath = pathname.replace(`/${defaultLocale}`, "") || "/"
        setUrl(req, `${newPath}${url.search}`)
        return
    }

    // 2. If it's already an explicit non-default locale (e.g., /en), leave it alone
    if (locales.includes(firstPart)) {
        return
    }

    // 3. Under the hood, your application routing needs to know it's the default locale.
    // We rewrite the internal request URL so your app reads it as the default locale.
    // e.g., /login internally behaves like /fa/login
    const rewrittenPath = `/${defaultLocale}${pathname === "/" ? "" : pathname}`
    setUrl(req, `${rewrittenPath}${url.search}`)
}