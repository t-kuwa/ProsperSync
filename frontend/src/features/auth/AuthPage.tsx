import { useEffect } from "react";
import { DesktopHero, MobileHero } from "./components/HeroContent";
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
  } = useAuthFlow({ onAuthenticated });

  useEffect(() => {
    if (activeTab === "login") {
      document.title = "ログイン - Haruve";
    } else {
      document.title = "新規登録 - Haruve";
    }
  }, [activeTab]);

  const isSignup = activeTab === "signup";

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 lg:flex-row">
      <section className="relative flex w-full flex-1 flex-col overflow-hidden bg-white text-slate-900">
        <MobileHero />

        <div className="flex flex-1 flex-col gap-12 px-6 pb-12 pt-10 sm:px-12 lg:max-w-xl lg:px-16 xl:max-w-2xl">
          <header className="flex items-center justify-between">
            <span className="text-2xl font-semibold tracking-tight text-slate-900">Haruve</span>
            <button
              type="button"
              onClick={() => handleTabChange(isSignup ? "login" : "signup")}
              className="text-sm font-semibold text-indigo-500 transition hover:text-indigo-400"
            >
              {isSignup ? "ログイン" : "アカウントを作成"}
            </button>
          </header>

          <div className="flex flex-1 flex-col justify-center">
            <div className="max-w-md space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-500/80">
                  {isSignup ? "Create account" : "Login"}
                </p>
                <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                  {isSignup ? "Haruveで新しいはじまりを" : "Haruveにログイン"}
                </h1>
                <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                  {isSignup
                    ? "数分で家計管理をスタート。共同作業に最適なスペースで、チーム全員が同じページを共有できます。"
                    : "暮らしをより良くする家計管理を続けましょう。保存された支出や共有ノートへすぐにアクセスできます。"}
                </p>
              </div>

              {isSignup ? (
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
            </div>
          </div>

          <footer className="text-xs text-slate-400">
            {isSignup ? "すでにアカウントをお持ちですか？" : "アカウントをまだお持ちではありませんか？"}{" "}
            <button
              type="button"
              onClick={() => handleTabChange(isSignup ? "login" : "signup")}
              className="font-medium text-indigo-500 hover:text-indigo-400"
            >
              {isSignup ? "ログイン" : "アカウントを作成"}
            </button>
          </footer>
        </div>
      </section>

      <DesktopHero />
    </main>
  );
};

export default AuthPage;
