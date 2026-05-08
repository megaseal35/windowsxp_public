export interface LoginRequest {
  username: string;
  password: string;
}

export interface SessionStatus {
  loggedIn: boolean;
  username?: string;
}
