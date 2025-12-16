export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface GetUserRequest {
  id: number;
}

export interface GetUserResponse extends User {}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

export interface UpdateProfileResponse extends User {}

