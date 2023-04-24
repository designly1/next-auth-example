export interface User {
    id: string,
    fullName: string,
    email: string,
    username: string,
    password: string,
    tokens:  LoginToken[],
}

export interface LoginToken {
    token: string,
    expires: string
}

export interface LoginCookie {
    token: LoginToken,
    user: User
}

export interface LoginProps {
    username: string,
    password: string
}

export interface AuthContextType {
    user: User | null;
    login: (props: LoginProps) => Promise<boolean>;
    logout: () => Promise<void>;
    reload: () => void;
    sendPasswordResetEmail: (email: string) => void;
    setLoginCookie: (data: LoginCookie) => void;
}