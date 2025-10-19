


export interface User {
  id: string;
  email: string;
  name: string;
}
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
   message: string;
   user: User;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
}