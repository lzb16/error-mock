import { createRequest } from '../../utils/request';
import type {
  GetUserRequest,
  GetUserResponse,
  LoginRequest,
  LoginResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from './_interface';

export const getUserUrl = '/api/user/info';
export const getUser = createRequest<GetUserResponse, GetUserRequest>({
  url: getUserUrl,
  method: 'GET',
});

export const loginUrl = '/api/user/login';
export const login = createRequest<LoginResponse, LoginRequest>({
  url: loginUrl,
  method: 'POST',
});

export const updateProfileUrl = '/api/user/profile';
export const updateProfile = createRequest<UpdateProfileResponse, UpdateProfileRequest>({
  url: updateProfileUrl,
  method: 'PUT',
});
