export default async function middleware(
    req: any,
    res: any,
): Promise<void> {
    // Inject a response header on every request
    res.setHeader('X-Powered-By', 'nukejs')
    // Return without ending → request continues to routing
}