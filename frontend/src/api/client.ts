import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// 401エラー時に認証状態をクリアするためのイベント名
export const AUTH_ERROR_EVENT = "haruve:auth-error";

// 認証不要なエンドポイント（これらのエンドポイントでの401エラーは無視）
const AUTH_EXEMPT_PATTERNS = [
  "/api/v1/login",
  "/api/v1/users",
  "/api/v1/users/password",
  "/health",
  "/up",
];

// 認証が必要なエンドポイントかどうかを判定
const requiresAuthentication = (url: string | undefined): boolean => {
  if (!url) return false;
  
  // baseURLが含まれている場合は除去
  const baseURL = apiClient.defaults.baseURL || "";
  const relativeUrl = url.replace(baseURL, "");
  
  // 認証不要なエンドポイントをスキップ
  if (AUTH_EXEMPT_PATTERNS.some((pattern) => relativeUrl.includes(pattern))) {
    return false;
  }
  
  // /api/v1/で始まるエンドポイントは認証が必要（ログイン/新規登録/パスワードリセット以外）
  return relativeUrl.includes("/api/v1/");
};

// リクエストインターセプター: 認証が必要なエンドポイントにAuthorizationヘッダーが設定されていない場合は設定する
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window === "undefined") {
      return config;
    }

    const STORAGE_KEY = "haruve-auth";
    const url = config.url || "";

    // 認証が必要なエンドポイントで、Authorizationヘッダーが設定されていない場合
    if (
      requiresAuthentication(url) &&
      !config.headers.Authorization &&
      !apiClient.defaults.headers.common.Authorization
    ) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const auth = JSON.parse(stored) as { token?: string };
          if (auth?.token) {
            config.headers.Authorization = `Bearer ${auth.token}`;
          }
        } catch {
          // パースエラーは無視
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// レスポンスインターセプター: 401エラー時に自動的にログアウト処理を行う
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 実際にサーバーから401レスポンスが返ってきた場合のみ処理
    // リクエストキャンセルやネットワークエラーは無視
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.url
    ) {
      const requestUrl = error.config.url;
      const STORAGE_KEY = "haruve-auth";

      // 認証が必要なエンドポイントで401エラーが発生し、
      // かつ既にログインしている場合のみログアウト処理を実行
      if (
        typeof window !== "undefined" &&
        requiresAuthentication(requestUrl) &&
        window.localStorage.getItem(STORAGE_KEY)
      ) {
        window.localStorage.removeItem(STORAGE_KEY);
        // App.tsxに通知するためのカスタムイベントを発火
        window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT));
      }
    }
    return Promise.reject(error);
  },
);

export type ApiErrorResponse = {
  errors?: string[];
  error?: string;
  message?: string;
};

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    const status = error.response?.status;
    const code = error.code;

    // サーバーから返されたエラーメッセージを優先的に使用
    if (data?.errors?.length) {
      return data.errors.join("\n");
    }

    if (data?.error) {
      return data.error;
    }

    if (data?.message) {
      return data.message;
    }

    // HTTPステータスコードに応じたメッセージ
    if (status) {
      switch (status) {
        case 400:
          return "リクエストが不正です。入力内容を確認してください。";
        case 401:
          return "認証に失敗しました。再度ログインしてください。";
        case 403:
          return "この操作を実行する権限がありません。";
        case 404:
          return "リソースが見つかりませんでした。";
        case 422:
          return "入力内容に問題があります。確認してください。";
        case 500:
          return "サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。";
        case 503:
          return "サービスが一時的に利用できません。しばらく時間をおいて再度お試しください。";
        default:
          if (status >= 500) {
            return "サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。";
          }
          if (status >= 400) {
            return "リクエストエラーが発生しました。";
          }
      }
    }

    // ネットワークエラーやタイムアウトの検出
    if (code === "ECONNABORTED" || code === "ETIMEDOUT") {
      return "リクエストがタイムアウトしました。ネットワーク接続を確認してください。";
    }

    if (code === "ERR_NETWORK" || code === "ECONNREFUSED") {
      return "ネットワークエラーが発生しました。接続を確認してください。";
    }

    if (code === "ERR_CANCELED") {
      return "リクエストがキャンセルされました。";
    }

    // Axiosエラーメッセージがある場合は使用
    if (error.message) {
      return error.message;
    }

    // レスポンスがない場合（ネットワークエラーなど）
    if (!error.response) {
      return "サーバーに接続できませんでした。ネットワーク接続を確認してください。";
    }
  }

  // Errorオブジェクトの場合
  if (error instanceof Error) {
    return error.message || "エラーが発生しました。";
  }

  // その他の予期しないエラー
  return "予期しないエラーが発生しました。";
};
