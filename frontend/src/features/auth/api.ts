import { apiClient } from "../../api/client";
import type { AuthSuccess } from "./types";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    primary_account_id?: number | null;
  };
};

const toAuthSuccess = (data: LoginResponse): AuthSuccess => ({
  token: data.token,
  user: {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    primaryAccountId: data.user.primary_account_id ?? null,
  },
});

export const loginUser = async (
  credentials: LoginRequest,
): Promise<AuthSuccess> => {
  const { data } = await apiClient.post<LoginResponse>("/api/v1/login", {
    api_v1_user: credentials,
  });

  return toAuthSuccess(data);
};

type SignupRequest = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export const registerUser = async ({
  name,
  email,
  password,
  passwordConfirmation,
}: SignupRequest): Promise<AuthSuccess> => {
  await apiClient.post("/api/v1/users", {
    api_v1_user: {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    },
  });

  return loginUser({ email, password });
};

export const logoutUser = async () => {
  await apiClient.delete("/api/v1/logout");
};

export const quickLogin = async (): Promise<AuthSuccess> => {
  const { data } = await apiClient.post<LoginResponse>("/api/v1/users/quick_login");

  return toAuthSuccess(data);
};
