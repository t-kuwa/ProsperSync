import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { apiClient, getErrorMessage } from "../../api/client";
import AuthCard from "./components/AuthCard";
import { DesktopHero, MobileHero } from "./components/HeroContent";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import type {
  ActiveTab,
  LoginFormValues,
  SignupFormValues,
  Status,
} from "./types";
import { loginUser, registerUser } from "./api";

const initialLoginForm: LoginFormValues = {
  email: "",
  password: "",
};

const initialSignupForm: SignupFormValues = {
  familyName: "",
  givenName: "",
  email: "",
  password: "",
  passwordConfirmation: "",
  acceptTerms: false,
};

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("signup");
  const [loginForm, setLoginForm] = useState<LoginFormValues>(initialLoginForm);
  const [signupForm, setSignupForm] = useState<SignupFormValues>(
    initialSignupForm,
  );
  const [loginStatus, setLoginStatus] = useState<Status | null>(null);
  const [signupStatus, setSignupStatus] = useState<Status | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const baseUrl = apiClient.defaults.baseURL;

  const combinedName = useMemo(
    () =>
      [signupForm.familyName, signupForm.givenName]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" "),
    [signupForm.familyName, signupForm.givenName],
  );

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === "login") {
      setSignupStatus(null);
    } else {
      setLoginStatus(null);
    }
  };

  const handleLoginChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = target;
    setSignupForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginStatus(null);

    try {
      const data = await loginUser({
        email: loginForm.email,
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
  };

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!signupForm.acceptTerms) {
      setSignupStatus({
        type: "error",
        message: "利用規約に同意してください。",
      });
      return;
    }

    if (!combinedName) {
      setSignupStatus({
        type: "error",
        message: "姓と名を入力してください。",
      });
      return;
    }

    setSignupLoading(true);
    setSignupStatus(null);

    try {
      const data = await registerUser({
        name: combinedName,
        email: signupForm.email,
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
  };

  return (
    <main className="min-h-screen bg-slate-950 md:flex md:items-center md:justify-center md:px-6 md:py-10">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-hidden bg-slate-950 md:min-h-0 md:flex-row md:items-stretch md:rounded-3xl md:bg-slate-900 md:shadow-2xl md:shadow-slate-950/60 md:ring-1 md:ring-slate-800">
        <MobileHero />
        <DesktopHero />

        <div className="relative flex flex-1 flex-col bg-transparent text-slate-100 md:bg-slate-950/40 md:p-10">
          <AuthCard
            activeTab={activeTab}
            onTabChange={handleTabChange}
            heading={activeTab === "signup" ? "新しいアカウントを作成" : "おかえりなさい"}
            subheading={
              activeTab === "signup"
                ? "まずはアカウントを作成して、体験をはじめましょう。"
                : "アカウントにサインインして、体験を続けましょう。"
            }
          >
            {activeTab === "signup" ? (
              <SignupForm
                values={signupForm}
                loading={signupLoading}
                status={signupStatus}
                onChange={handleSignupChange}
                onSubmit={handleSignupSubmit}
              />
            ) : (
              <LoginForm
                values={loginForm}
                loading={loginLoading}
                status={loginStatus}
                onChange={handleLoginChange}
                onSubmit={handleLoginSubmit}
              />
            )}
          </AuthCard>

          <div className="mt-12 text-xs text-slate-500">
            API base URL: <code className="rounded bg-slate-900 px-2 py-1 text-slate-300">{baseUrl}</code>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
