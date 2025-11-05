export type Status = {
  type: "success" | "error";
  message: string;
};

export type LoginFormValues = {
  email: string;
  password: string;
};

export type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  acceptTerms: boolean;
};

export type ActiveTab = "signup" | "login";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  primaryAccountId: number | null;
};

export type AuthSuccess = {
  token: string;
  user: AuthUser;
};
