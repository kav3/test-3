const locales = ["fa", "en"]

export default async function middleware(
    req: any,
    _res: any,
) {
    console.log("middleware start")
    if (!req.url) return

    const url = new URL(req.url, "http://localhost")
    const pathname = url.pathname

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
    req.url = `/${"fa"}${pathname === "/" ? "" : pathname}${url.search}`

    console.log("middleware end")
}