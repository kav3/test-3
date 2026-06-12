import type { IncomingMessage, ServerResponse } from 'http'

export default async function middleware(
    req: IncomingMessage,
    res: ServerResponse,
): Promise<void> {
    // Inject a response header on every request
    res.setHeader('X-Powered-By', 'nukejs')
    // Return without ending → request continues to routing
}