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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <HaruveIcon className="h-12 w-12" />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
            {activeTab === "signup" ? "Create your account" : "Sign in to your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            {activeTab === "signup"
              ? "Start your journey with us today."
              : "Welcome back! Please enter your details."}
          </p>
        </div>

        <AuthCard
          activeTab={activeTab}
          onTabChange={handleTabChange}
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
    </div>
  );
};

export default AuthPage;
