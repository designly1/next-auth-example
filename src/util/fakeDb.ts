import { User } from '@/interfaces'

const today = new Date();
const futureDate = new Date();
futureDate.setDate(today.getDate() + 30);

const userData: User = {
    id: "szbxTRMAbSaCMxdmk7AMbIfSCO",
    fullName: "Joe Blow",
    email: "joeblow@example.com",
    username: "joeblow",
    password: "$2a$12$PUnDAFhNom/em/8nYc4kdOvEgUpYSA2aTcJ0B83qR0LQvG55.Z/de",
    tokens: [
        {
            token: "7XOOBmzLlLlc7fZOk7KyuVFvxnSooVHNV7N4Yh7cdc4NP5bLZZaPMtDV7jPKxHp3HZ51Kh64W4d6wcAuJvHoqhg3TWHaV18zI2szBDLAiwKVEVtRqMeHHn8z3HbpYg5z",
            expires: futureDate.toISOString()
        }
    ]
};

/**
 * This function simulates a database call.
 * It returns a fake user object after 300ms
 * 
 * @author Jay Simons
 */
export default function fakeDb(id: string): Promise<User> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (
                id === userData.id ||
                id === userData.username ||
                id === userData.email ||
                userData.tokens.find(token => token.token === id && new Date(token.expires) > new Date())
            ) {
                resolve(userData);
            } else {
                reject(false);
            }
        }, 500);
    });
}