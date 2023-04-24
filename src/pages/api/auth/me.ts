import fakeDb from "@/util/fakeDb";
import sanitizeUser from "@/util/sanitizeUser";
import { parse } from "cookie";

// Use edge runtime to improve performance.
export const config = {
    runtime: 'edge'
}

export async function unauth() {
    return new Response('Unauthorized', { status: 401 });
}

export default async function handler(request: Request) {
    try {
        // Fetch login cookie
        const cookies = parse(request.headers.get('Cookie') || '');
        const cookie = cookies[process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY || ''];
        if (!cookie) return unauth();
        const cookieData = JSON.parse(cookie);

        // Check if cookie is valid
        if (!cookieData.token || !cookieData.token.token || !cookieData.token.expires) return unauth();
        if (new Date(cookieData.token.expires) < new Date()) return unauth();

        // Fetch user from database
        let user;
        try {
            user = await fakeDb(cookieData.token.token);
        } catch (err) {
            return unauth();
        }
        
        // Check if user exists
        if (!user) return unauth();

        // Return user and token
        return new Response(JSON.stringify(sanitizeUser(user)), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        if (err instanceof Error) {
            return new Response(err.message, { status: 500 });
        } else {
            return new Response('Unknown error', { status: 500 });
        }

    }
}