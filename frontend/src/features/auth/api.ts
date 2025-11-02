import { apiClient } from "../../api/client";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: {
    name: string;
    email: string;
  };
};

export const loginUser = async (credentials: LoginRequest) => {
  const { data } = await apiClient.post<LoginResponse>("/api/v1/login", {
    api_v1_user: credentials,
  });

  return data;
};

type SignupRequest = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type SignupResponse = {
  token: string;
  user: {
    name: string;
    email: string;
  };
};

export const registerUser = async ({
  name,
  email,
  password,
  passwordConfirmation,
}: SignupRequest) => {
  const { data } = await apiClient.post<SignupResponse>("/api/v1/users", {
    api_v1_user: {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    },
  });

  return data;
};
