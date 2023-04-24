import { User } from "@/interfaces"

/**
 * This function removes sensitive data from the user object
 * before sending it to the client.
 * 
 * @author Jay Simons
 */
export default function sanitizeUser(user: User) {
    return {
        ...user,
        password: '',
        tokens: []
    }
}