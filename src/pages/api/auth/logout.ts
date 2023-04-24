// Use edge runtime to improve performance.
export const config = {
    runtime: 'edge'
}

export default async function handler(request: Request) {
    // Simulate a slow request.
    // Generally, you would remove the login token from the user record in DB
    setTimeout(() => {
        return new Response('OK');
    }, 300);
}