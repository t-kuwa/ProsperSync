import { useEffect } from "react";
import HaruveIcon from "../dashboard/components/HaruveIcon";
import AuthCard from "./components/AuthCard";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import useAuthFlow from "./hooks/useAuthFlow";
import type { AuthSuccess } from "./types";

type AuthPageProps = {
  onAuthenticated?: (auth: AuthSuccess) => void;
};

const AuthPage = ({ onAuthenticated }: AuthPageProps) => {
  const {
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
    handleQuickLogin,
  } = useAuthFlow({ onAuthenticated });

  useEffect(() => {
    if (activeTab === "login") {
      document.title = "ログイン - Haruve";
    } else {
      document.title = "新規登録 - Haruve";
    }
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-slate-50 md:flex md:items-center md:justify-center md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-md px-6 py-10 md:px-0">
        <div className="mb-8 flex flex-col items-center gap-3">
          <HaruveIcon className="h-12 w-12" />
          <p className="text-2xl font-semibold tracking-tight text-slate-900">Haruve</p>
        </div>
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
              onQuickLogin={handleQuickLogin}
            />
          )}
        </AuthCard>
      </div>
    </main>
  );
};

export default AuthPage;
