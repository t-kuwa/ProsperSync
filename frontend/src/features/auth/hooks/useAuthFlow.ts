import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { getErrorMessage } from "../../../api/client";
import { loginUser, registerUser } from "../api";
import type {
  ActiveTab,
  LoginFormValues,
  SignupFormValues,
  Status,
} from "../types";

const initialLoginForm: LoginFormValues = {
  email: "",
  password: "",
};

const initialSignupForm: SignupFormValues = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
  acceptTerms: false,
};

const useAuthFlow = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("signup");
  const [loginForm, setLoginForm] = useState<LoginFormValues>(initialLoginForm);
  const [signupForm, setSignupForm] =
    useState<SignupFormValues>(initialSignupForm);
  const [loginStatus, setLoginStatus] = useState<Status | null>(null);
  const [signupStatus, setSignupStatus] = useState<Status | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);

    if (tab === "login") {
      setSignupStatus(null);
    } else {
      setLoginStatus(null);
    }
  }, []);

  const handleLoginChange = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = target;
      setLoginForm((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleSignupChange = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = target;
      setSignupForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    [],
  );

  const handleLoginSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoginLoading(true);
      setLoginStatus(null);

      try {
        const data = await loginUser({
          email: loginForm.email.trim(),
          password: loginForm.password,
        });

        setLoginStatus({
          type: "success",
          message: `${data.user.name}としてログインしました。トークン: ${data.token}`,
        });
      } catch (error) {
        setLoginStatus({ type: "error", message: getErrorMessage(error) });
      } finally {
        setLoginLoading(false);
      }
    },
    [loginForm.email, loginForm.password],
  );

  const handleSignupSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!signupForm.acceptTerms) {
        setSignupStatus({
          type: "error",
          message: "利用規約に同意してください。",
        });
        return;
      }

      if (!signupForm.name) {
        setSignupStatus({
          type: "error",
          message: "名前を入力してください。",
        });
        return;
      }

      setSignupLoading(true);
      setSignupStatus(null);

      try {
        const data = await registerUser({
          name: signupForm.name.trim(),
          email: signupForm.email.trim(),
          password: signupForm.password,
          passwordConfirmation: signupForm.passwordConfirmation,
        });

        setSignupStatus({
          type: "success",
          message: `${data.user.name}さんのアカウントを作成しました。ログインして利用を開始してください。`,
        });
        setSignupForm(initialSignupForm);
      } catch (error) {
        setSignupStatus({ type: "error", message: getErrorMessage(error) });
      } finally {
        setSignupLoading(false);
      }
    },
    [
      signupForm.name,
      signupForm.acceptTerms,
      signupForm.email,
      signupForm.password,
      signupForm.passwordConfirmation,
    ],
  );

  return {
    activeTab,
    loginForm,
    signupForm,
    loginStatus,
    signupStatus,
    loginLoading,
    signupLoading,
    handleTabChange,
    handleLoginChange,
    handleSignupChange,
    handleLoginSubmit,
    handleSignupSubmit,
  };
};

export default useAuthFlow;
