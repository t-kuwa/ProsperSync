export type Status = {
  type: "success" | "error";
  message: string;
};

export type LoginFormValues = {
  email: string;
  password: string;
};

export type SignupFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  acceptTerms: boolean;
};

export type ActiveTab = "signup" | "login";
