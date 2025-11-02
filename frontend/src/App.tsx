import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

type Status = {
  type: "success" | "error";
  message: string;
};

type LoginForm = {
  email: string;
  password: string;
};

type SignupForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  acceptTerms: boolean;
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { errors?: string[]; error?: string; message?: string }
      | undefined;

    if (data?.errors && data.errors.length > 0) {
      return data.errors.join("\n");
    }

    if (data?.error) {
      return data.error;
    }

    if (data?.message) {
      return data.message;
    }

    return error.message;
  }

  return "予期しないエラーが発生しました。";
};

const App = () => {
  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [signupForm, setSignupForm] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    acceptTerms: false,
  });
  const [loginStatus, setLoginStatus] = useState<Status | null>(null);
  const [signupStatus, setSignupStatus] = useState<Status | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const baseUrl = apiClient.defaults.baseURL;

  const handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setSignupForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const combinedName = useMemo(() => {
    return [signupForm.firstName, signupForm.lastName]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" ");
  }, [signupForm.firstName, signupForm.lastName]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginStatus(null);

    try {
      const { data } = await apiClient.post("/api/v1/login", {
        user: {
          email: loginForm.email,
          password: loginForm.password,
        },
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
      const { data } = await apiClient.post("/api/v1/users", {
        user: {
          name: combinedName,
          email: signupForm.email,
          password: signupForm.password,
          password_confirmation: signupForm.passwordConfirmation,
        },
      });

      setSignupStatus({
        type: "success",
        message: `${data.user.name}さんのアカウントを作成しました。ログインして利用を開始してください。`,
      });
    } catch (error) {
      setSignupStatus({ type: "error", message: getErrorMessage(error) });
    } finally {
      setSignupLoading(false);
    }
  };

  const toggleButtonClass = (tab: "signup" | "login") =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      activeTab === tab
        ? "bg-slate-900 text-white shadow-lg shadow-indigo-500/20"
        : "text-slate-400 hover:text-white"
    }`;

  const statusClassName = (status: Status) =>
    `rounded-lg border px-4 py-3 text-sm ${
      status.type === "success"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
        : "border-rose-500/30 bg-rose-500/10 text-rose-200"
    }`;

  return (
    <main className="min-h-screen bg-slate-950 md:flex md:items-center md:justify-center md:px-6 md:py-10">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-hidden bg-slate-950 md:min-h-0 md:flex-row md:items-stretch md:rounded-3xl md:bg-slate-900 md:shadow-2xl md:shadow-slate-950/60 md:ring-1 md:ring-slate-800">
        <div className="md:hidden">
          <div className="relative h-80 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-indigo-800 to-slate-900" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.45),transparent_60%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between p-8 text-slate-100">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-lg font-semibold tracking-wide">AMU</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-wide text-slate-100 backdrop-blur transition hover:bg-white/20"
                >
                  Back to website
                  <span aria-hidden>↗</span>
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.4em] text-indigo-200/80">Create Moments</p>
                <h2 className="text-3xl font-semibold leading-snug">
                  Capturing Moments,
                  <br />
                  Creating Memories
                </h2>
                <p className="text-sm text-indigo-100/80">
                  ハイクオリティな体験を共有し、チームでのコラボレーションを加速させましょう。
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-indigo-100/70">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-semibold">
                  24
                </span>
                <p className="max-w-[14rem]">
                  24時間以内のサポート体制で、安心して導入いただけます。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden flex-1 flex-col justify-between bg-gradient-to-br from-slate-800 via-indigo-800 to-slate-900 p-10 text-slate-100 md:flex">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-lg font-semibold tracking-wide">AMU</span>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-wide text-slate-100 backdrop-blur transition hover:bg-white/20"
            >
              Back to website
              <span aria-hidden>↗</span>
            </button>
          </div>
          <div className="mt-16 space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-indigo-200/80">Create Moments</p>
            <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
              Capturing Moments,
              <br />
              Creating Memories
            </h2>
            <p className="max-w-xs text-sm text-indigo-100/80">
              ハイクオリティな体験を共有し、チームでのコラボレーションを加速させましょう。
            </p>
          </div>
          <div className="mt-16 flex items-center gap-3 text-xs text-indigo-100/70">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-semibold">
              24
            </span>
            <p className="max-w-[14rem]">
              24時間以内のサポート体制で、安心して導入いただけます。
            </p>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col bg-transparent text-slate-100 md:bg-slate-950/40 md:p-10">
          <div className="relative z-10 -mt-12 flex flex-1 flex-col rounded-t-3xl bg-slate-950 px-6 py-10 shadow-[0_-32px_80px_rgba(15,23,42,0.45)] md:mt-0 md:rounded-none md:bg-transparent md:px-10 md:py-10 md:shadow-none">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
              <span>アカウントをお持ちですか？</span>
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="font-semibold text-indigo-300 hover:text-indigo-200"
              >
                ログイン
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className={toggleButtonClass("signup")}
              >
                アカウント登録
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={toggleButtonClass("login")}
              >
                ログイン
              </button>
            </div>

            <div className="mt-8">
              {activeTab === "signup" ? (
                <>
                  <h1 className="text-3xl font-semibold text-white md:text-4xl">
                    新しいアカウントを作成
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">
                    まずはアカウントを作成して、体験をはじめましょう。
                  </p>
                  <form onSubmit={handleSignupSubmit} className="mt-8 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <label className="flex flex-col text-sm text-slate-300">
                        <span className="mb-2 font-medium">姓</span>
                        <input
                          type="text"
                          name="firstName"
                          value={signupForm.firstName}
                          onChange={handleSignupChange}
                          autoComplete="given-name"
                          className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                          placeholder="山田"
                          required
                        />
                      </label>
                      <label className="flex flex-col text-sm text-slate-300">
                        <span className="mb-2 font-medium">名</span>
                        <input
                          type="text"
                          name="lastName"
                          value={signupForm.lastName}
                          onChange={handleSignupChange}
                          autoComplete="family-name"
                          className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                          placeholder="太郎"
                          required
                        />
                      </label>
                    </div>
                    <label className="flex flex-col text-sm text-slate-300">
                      <span className="mb-2 font-medium">メールアドレス</span>
                      <input
                        type="email"
                        name="email"
                        value={signupForm.email}
                        onChange={handleSignupChange}
                        autoComplete="email"
                        className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                        placeholder="example@company.com"
                        required
                      />
                    </label>
                    <div className="grid gap-6 md:grid-cols-2">
                      <label className="flex flex-col text-sm text-slate-300">
                        <span className="mb-2 font-medium">パスワード</span>
                        <input
                          type="password"
                          name="password"
                          value={signupForm.password}
                          onChange={handleSignupChange}
                          autoComplete="new-password"
                          className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                          placeholder="••••••••"
                          minLength={6}
                          required
                        />
                      </label>
                      <label className="flex flex-col text-sm text-slate-300">
                        <span className="mb-2 font-medium">パスワード（確認）</span>
                        <input
                          type="password"
                          name="passwordConfirmation"
                          value={signupForm.passwordConfirmation}
                          onChange={handleSignupChange}
                          autoComplete="new-password"
                          className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                          placeholder="••••••••"
                          minLength={6}
                          required
                        />
                      </label>
                    </div>
                    <label className="flex items-start gap-3 text-xs text-slate-400">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={signupForm.acceptTerms}
                        onChange={handleSignupChange}
                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                      />
                      <span>
                        <span className="font-medium text-slate-200">利用規約</span>と
                        <span className="font-medium text-slate-200">プライバシーポリシー</span>に同意します。
                      </span>
                    </label>
                    <button
                      type="submit"
                      disabled={signupLoading}
                      className="flex w-full items-center justify-center rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-500/50"
                    >
                      {signupLoading ? "作成中..." : "アカウントを作成"}
                    </button>
                    <div className="grid gap-3 md:grid-cols-2">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900/70"
                      >
                        <span role="img" aria-label="google" className="text-lg">
                          🔍
                        </span>
                        Googleで登録
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900/70"
                      >
                        <span role="img" aria-label="apple" className="text-lg">
                          🍎
                        </span>
                        Appleで登録
                      </button>
                    </div>
                    {signupStatus && (
                      <p className={statusClassName(signupStatus)}>{signupStatus.message}</p>
                    )}
                  </form>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-semibold text-white md:text-4xl">
                    おかえりなさい
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">
                    アカウントにサインインして、体験を続けましょう。
                  </p>
                  <form onSubmit={handleLoginSubmit} className="mt-8 space-y-6">
                    <label className="flex flex-col text-sm text-slate-300">
                      <span className="mb-2 font-medium">メールアドレス</span>
                      <input
                        type="email"
                        name="email"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        autoComplete="email"
                        className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                        placeholder="example@company.com"
                        required
                      />
                    </label>
                    <label className="flex flex-col text-sm text-slate-300">
                      <span className="mb-2 font-medium">パスワード</span>
                      <input
                        type="password"
                        name="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        autoComplete="current-password"
                        className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
                        placeholder="••••••••"
                        required
                      />
                    </label>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                        />
                        ログイン情報を保存
                      </label>
                      <button type="button" className="font-semibold text-indigo-300 hover:text-indigo-200">
                        パスワードをお忘れですか？
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="flex w-full items-center justify-center rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-500/50"
                    >
                      {loginLoading ? "サインイン中..." : "サインイン"}
                    </button>
                    {loginStatus && (
                      <p className={statusClassName(loginStatus)}>{loginStatus.message}</p>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="mt-12 text-xs text-slate-500">
            API base URL: <code className="rounded bg-slate-900 px-2 py-1 text-slate-300">{baseUrl}</code>
          </div>
        </div>
      </section>
    </main>
  );
};

export default App;
