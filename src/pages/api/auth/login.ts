import fakeDb from "@/util/fakeDb";
import { compareSync } from "bcryptjs";
import sanitizeUser from "@/util/sanitizeUser";

// Use edge runtime to improve performance.
export const config = {
    runtime: 'edge'
}

export async function unauth() {
    return new Response('Unauthorized', { status: 401 });
}

export default async function handler(request: Request) {
    try {
        const data = await request.json();
        let user;
        // Fetch user from database
        try {
            user = await fakeDb(data.username);
        } catch (err) {
            return unauth();
        }
        // Check if user exists
        if (!user) return unauth();
        // Verify password
        if (!compareSync(data.password, user.password)) {
            return unauth();
        }
        // Generate token
        const token = user.tokens[0]; // Normally we would generate one

        // Return user and token
        return new Response(JSON.stringify({
            user: sanitizeUser(user),
            token
        }), {
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