import { useEffect } from "react";
import HaruveIcon from "../dashboard/components/HaruveIcon";
import AuthCard from "./components/AuthCard";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import useAuthFlow from "./hooks/useAuthFlow";
import type { AuthSuccess } from "./types";

const HIGHLIGHTS = [
  {
    title: "瞬時の同期",
    description: "記録した取引はリアルタイムでダッシュボードへ反映され、どの端末でも同じ体験を得られます。",
  },
  {
    title: "洗練された操作性",
    description: "Appleが作るアプリのような滑らかなアニメーションと、美しい角丸のカードデザイン。",
  },
  {
    title: "スマホ最適",
    description: "ボトムタブや大きめのタップターゲットで、片手でも直感的に操作できます。",
  },
];

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
    <main className="relative min-h-screen overflow-hidden bg-transparent text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-[140px]" />
        <div className="absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-emerald-100/50 blur-[180px]" />
      </div>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-center lg:py-20">
        <section className="w-full lg:w-1/2">
          <div className="overflow-hidden rounded-[40px] border border-white/50 bg-white/70 p-8 shadow-floating ring-1 ring-white/80 backdrop-blur">
            <div className="flex items-center gap-3 text-slate-900">
              <HaruveIcon className="h-12 w-12" />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">financial os</p>
                <p className="text-3xl font-semibold">Haruve</p>
              </div>
            </div>
            <p className="mt-6 text-4xl font-semibold leading-tight">
              あなたの資産管理を、
              <br className="hidden lg:block" />
              AppleクオリティのUIで。
            </p>
            <p className="mt-4 text-base text-slate-500">
              透明感のあるガラス調のカード、ダイナミックな余白、そしてスマートなモバイル体験。すべてのプラットフォームで心地よい操作感を実現しました。
            </p>
            <dl className="mt-8 grid gap-4 md:grid-cols-2">
              {HIGHLIGHTS.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm">
                  <dt className="text-sm font-semibold text-slate-900">{item.title}</dt>
                  <dd className="mt-1 text-sm text-slate-500">{item.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="w-full max-w-md lg:w-[420px]">
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
        </section>
      </div>
    </main>
  );
};

export default AuthPage;
