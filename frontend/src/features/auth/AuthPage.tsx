import { useEffect } from "react";
import { apiClient } from "../../api/client";
import AuthCard from "./components/AuthCard";
import { DesktopHero, MobileHero } from "./components/HeroContent";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import useAuthFlow from "./hooks/useAuthFlow";

const AuthPage = () => {
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
  } = useAuthFlow();

  useEffect(() => {
    if (activeTab === "login") {
      document.title = "ログイン - Haruve";
    } else {
      document.title = "新規登録 - Haruve";
    }
  }, [activeTab]);

  const baseUrl = apiClient.defaults.baseURL;

  return (
    <main className="min-h-screen bg-slate-950 md:flex md:items-center md:justify-center md:px-6 md:py-10">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-y-auto bg-slate-950 md:h-[90vh] md:min-h-0 md:flex-row md:items-stretch md:rounded-3xl md:bg-slate-900 md:shadow-2xl md:shadow-slate-950/60 md:ring-1 md:ring-slate-800">
        <MobileHero />
        <DesktopHero />

        <div className="relative flex flex-1 flex-col overflow-y-auto bg-transparent text-slate-100 md:bg-slate-950/40 md:p-6 lg:p-8 xl:p-10">
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
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
